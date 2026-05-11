package com.cryptotrading.repository;

import com.cryptotrading.model.Order;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;

@Repository
public interface OrderRepository extends JpaRepository<Order, Long> {
    
    // Find all orders by symbol
    List<Order> findBySymbol(String symbol);
    
    // Find all orders by status
    List<Order> findByStatus(Order.OrderStatus status);
    
    // Find all orders by type
    List<Order> findByType(Order.OrderType type);
    
    // Find all orders by symbol and status
    List<Order> findBySymbolAndStatus(String symbol, Order.OrderStatus status);
    
    // Find pending orders
    @Query("SELECT o FROM Order o WHERE o.status = 'PENDING' ORDER BY o.createdAt ASC")
    List<Order> findAllPendingOrders();
    
    // Find pending buy orders for a symbol
    @Query("SELECT o FROM Order o WHERE o.symbol = :symbol AND o.status = 'PENDING' AND o.type = 'BUY' ORDER BY o.price DESC")
    List<Order> findPendingBuyOrders(@Param("symbol") String symbol);
    
    // Find pending sell orders for a symbol
    @Query("SELECT o FROM Order o WHERE o.symbol = :symbol AND o.status = 'PENDING' AND o.type = 'SELL' ORDER BY o.price ASC")
    List<Order> findPendingSellOrders(@Param("symbol") String symbol);
    
    // Find orders created within a time range
    List<Order> findByCreatedAtBetween(LocalDateTime start, LocalDateTime end);
    
    // Find filled orders
    @Query("SELECT o FROM Order o WHERE o.status = 'FILLED' ORDER BY o.filledAt DESC")
    List<Order> findAllFilledOrders();
    
    // Find cancelled orders
    @Query("SELECT o FROM Order o WHERE o.status = 'CANCELLED' ORDER BY o.createdAt DESC")
    List<Order> findAllCancelledOrders();
    
    // Count pending orders by symbol
    @Query("SELECT COUNT(o) FROM Order o WHERE o.symbol = :symbol AND o.status = 'PENDING'")
    long countPendingOrdersBySymbol(@Param("symbol") String symbol);
    
    // Get total order volume by symbol
    @Query("SELECT SUM(o.quantity) FROM Order o WHERE o.symbol = :symbol AND o.status = 'FILLED'")
    Double getTotalVolumeBySymbol(@Param("symbol") String symbol);
}
