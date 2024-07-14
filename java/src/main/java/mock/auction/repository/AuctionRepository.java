package mock.auction.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import mock.auction.entity.Auction;

import java.time.LocalDateTime;
import java.util.List;

public interface AuctionRepository extends JpaRepository<Auction, Integer> {

    List<Auction> findByAsset_AssetName(String asset);

    /*@Query("SELECT a FROM Auction a WHERE a.startDate <= :endDate AND a.endDate >= :startDate AND a.startingPrice BETWEEN :minPrice AND :maxPrice")
    List<Auction> findAuctionsByDateRangeAndAmount(
            @Param("startDate") LocalDateTime startDate,
            @Param("endDate") LocalDateTime endDate,
            @Param("minPrice") double minPrice,
            @Param("maxPrice") double maxPrice);*/

            @Query("SELECT a FROM Auction a WHERE " +
           "(:startDate IS NULL OR a.endDate >= :startDate) AND " +
           "(:endDate IS NULL OR a.startDate <= :endDate) AND " +
           "(:minPrice IS NULL OR a.startingPrice >= :minPrice) AND " +
           "(:maxPrice IS NULL OR a.startingPrice <= :maxPrice)")
    List<Auction> findAuctionsByDateRangeAndAmount(
            @Param("startDate") LocalDateTime startDate,
            @Param("endDate") LocalDateTime endDate,
            @Param("minPrice") Double minPrice,
            @Param("maxPrice") Double maxPrice);
}