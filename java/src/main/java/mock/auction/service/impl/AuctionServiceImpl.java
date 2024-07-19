package mock.auction.service.impl;

import jakarta.transaction.Transactional;
import mock.auction.entity.*;
import mock.auction.exception.EntityNotFoundException;
import mock.auction.exception.ResourceNotFoundException;
import mock.auction.repository.*;
import mock.auction.repository.specifications.AuctionSpecification;
import mock.auction.response.AuctionResponse;
import mock.auction.service.AuctionService;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageImpl;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

@Service
public class AuctionServiceImpl implements AuctionService {
    private AuctionRepository auctionRepository;
    private AssetRepository assetRepository;
    private AuctionTypeRepository auctionTypeRepository;
    private AccountRepository accountRepository;
    @Autowired
    private RegistParticipateAuctionRepository registParticipateAuctionRepository;

    @Autowired
    public AuctionServiceImpl(AuctionRepository auctionRepository, AssetRepository assetRepository,
            AuctionTypeRepository auctionTypeRepository, AccountRepository accountRepository,
            RegistParticipateAuctionRepository registParticipateAuctionRepository) {
        this.auctionRepository = auctionRepository;
        this.assetRepository = assetRepository;
        this.auctionTypeRepository = auctionTypeRepository;
        this.accountRepository = accountRepository;
        this.registParticipateAuctionRepository = registParticipateAuctionRepository;
    }

    @Override
    @Transactional
    public Auction createAuction(Auction auction) {
        try {
            return auctionRepository.save(auction);
        } catch (Exception e) {
            throw new RuntimeException("Error updating auction", e);
        }
    }

    @Override
    @Transactional
    public Auction updateAuction(Integer id, Auction auction) {
        try {
            Optional<Auction> existAuction = auctionRepository.findById(id);
            if (existAuction.isPresent()) {
                return auctionRepository.saveAndFlush(auction);
            } else {
                throw new EntityNotFoundException("Auction not found with id: " + id);
            }
        } catch (Exception e) {
            throw new RuntimeException("Error updating auction", e);
        }
    }

    @Override
    @Transactional
    public void deleteAuction(Integer id) {
        try {
            if (auctionRepository.findById(id).isPresent()) {
                auctionRepository.deleteById(id);
            } else {
                throw new EntityNotFoundException("Auction not found with id: " + id);
            }
        } catch (Exception e) {
            throw new RuntimeException("Error deleting auction", e);
        }
    }

    @Override
    public List<AuctionResponse> getAllAuction() {
        try {
            return auctionRepository.findAll().stream().map(AuctionResponse::of).toList();
        } catch (Exception e) {
            throw new RuntimeException("Error fetching all auctions", e);
        }
    }

    @Override
    public List<AuctionResponse> searchAuction(String keyword) {
        try {
            return auctionRepository.findByAsset_AssetName(keyword).stream().map(AuctionResponse::of).toList();
        } catch (Exception e) {
            throw new RuntimeException("Error searching auction by keyword", e);
        }
    }

    @Override
    public List<AuctionResponse> filterAuction(LocalDateTime startDate, LocalDateTime endDate, Double minPrice,
            Double maxPrice) {
        try {
            return auctionRepository.findAuctionsByDateRangeAndAmount(startDate, endDate, minPrice, maxPrice).stream()
                    .map(AuctionResponse::of).toList();
        } catch (Exception e) {
            throw new RuntimeException("Error filtering auctions", e);
        }
    }

    @Override
    public Asset getAssetByAuctionId(Integer auctionId) {
        Auction auction = auctionRepository.findAuctionWithAssetById(auctionId)
                .orElseThrow(() -> new ResourceNotFoundException("Auction not found with id: " + auctionId));
        return auction.getAsset();
    }

    //Create units when auction ends
    @Override
    @Transactional
    public Auction closeAndFinalizeAuction(Integer auctionId, Integer winnerId, Double highestPrice,
            String paymentMethod, LocalDateTime timeLimit) {
        Auction auction = auctionRepository.findById(auctionId)
                .orElseThrow(() -> new ResourceNotFoundException("Auction not found with id: " + auctionId));

        if (auction.getEndDate().isAfter(LocalDateTime.now())) {
            throw new IllegalStateException("Auction has not ended yet");
        }
        Asset asset = auction.getAsset();

        if (winnerId != null && highestPrice != null) {
            AccountEntity winner = accountRepository.findById(winnerId)
                    .orElseThrow(() -> new ResourceNotFoundException("Winner not found with id: " + winnerId));

            // Fetch registration or participation fee for the winner
            RegistParticipateAuction registParticipateAuction = registParticipateAuctionRepository.findById(winnerId)
                    .orElseThrow(() -> new ResourceNotFoundException("Registration/participation details not found"));
            double registrationFee = registParticipateAuction.getAmount();

            auction.setHighestPrice(highestPrice);
            auction.setWinner(winner);
            auction.setPaymentStatus("pending");
            auction.setPaymentAmount(highestPrice - registrationFee);
            auction.setPaymentMethod(paymentMethod);
            auction.setAuctionStatus("complete");

            asset.setAssetStatus("sold"); // Update asset status to 'sold'

            // Notification for winner
            sendNotification(winner, "You have won the auction for asset " + asset.getAssetName()
                    + " with a bid amount of: " + highestPrice);
        } else {
            asset.setAssetStatus("unsold"); // Update asset status to 'unsold'
        }
        if (auction.getEndDate().equals(LocalDateTime.now())) {
            auction.setAuctionStatus("closed");
            throw new IllegalStateException("Auction ended");
        }

        assetRepository.save(asset); // Save asset status change
        return auctionRepository.save(auction); // Save auction changes
    }

    private void sendNotification(AccountEntity user, String message) {
        // send Notification
    }

    /**
     * search auctions
     * @param auctionStatus
     * @param sortOrder
     * @param pageNumber
     * @param pageSize
     * @param keyWord
     * @return List<AuctionResponse>
     * @throws Exception
     */
    @Override
    public Page<AuctionResponse> searchAuctions(String auctionStatus, String sortOrder, Integer pageNumber,
            Integer pageSize,
            String keyWord) throws Exception {
        if (auctionStatus == null) {
            auctionStatus = "preparing";
        }
        AuctionSpecification spec = createSpecification(auctionStatus, keyWord);
        Sort sort = Sort.by("asset.marketPrice");
        if ("desc".equalsIgnoreCase(sortOrder)) {
            sort = sort.descending();
        } else {
            sort = sort.ascending();
        }
        Pageable pageable = PageRequest.of(pageNumber, pageSize, sort);
        Page<Auction> page = auctionRepository.findAll(spec, pageable);
        List<Auction> auctions = page.getContent().stream()
                .filter(auction -> auction.getDelFlag() == false).toList();

        List<AuctionResponse> auctionResponses = auctions.stream()
                .map(AuctionResponse::of)
                .toList();

        return new PageImpl<>(auctionResponses, pageable, page.getTotalElements());
    }

    private AuctionSpecification createSpecification(String auctionStatus, String keyWord) {
        AuctionSpecification spec = new AuctionSpecification(auctionStatus, keyWord);

        if (keyWord == null) {
            spec = null; // Return null specification to fetch all if no filters are applied
        }

        return spec;
    }
}
