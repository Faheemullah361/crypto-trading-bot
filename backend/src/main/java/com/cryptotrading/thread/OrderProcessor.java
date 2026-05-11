package com.cryptotrading.thread;

import com.cryptotrading.model.Order;

/**
 * Order Processor demonstrating MULTI-THREADING with Runnable
 * Consumer thread that processes orders from the queue
 */
public class OrderProcessor implements Runnable {
    private OrderQueue orderQueue;
    private volatile boolean running;
    private String processorName;
    
    public OrderProcessor(OrderQueue orderQueue, String name) {
        this.orderQueue = orderQueue;
        this.processorName = name;
        this.running = false;
    }
    
    /**
     * MULTI-THREADING: Runnable implementation
     */
    @Override
    public void run() {
        System.out.println(processorName + " started processing orders");
        running = true;
        
        while (running) {
            try {
                // Take order from queue (blocks if empty)
                Order order = orderQueue.takeOrder();
                
                // Process the order
                processOrder(order);
                
                // MULTI-THREADING: Sleep demonstration
                Thread.sleep(1000);
                
            } catch (InterruptedException e) {
                System.out.println(processorName + " interrupted");
                Thread.currentThread().interrupt();
                break;
            }
        }
        
        System.out.println(processorName + " stopped");
    }
    
    /**
     * SYNCHRONIZATION: Synchronized order processing
     */
    private synchronized void processOrder(Order order) {
        System.out.println(processorName + " processing " + order.getType() + 
            " order at price: " + order.getPrice());
        
        // Simulate order execution time
        try {
            Thread.sleep(500);
            order.setStatus(Order.OrderStatus.FILLED);
            System.out.println(processorName + " completed order: " + order.getId());
        } catch (InterruptedException e) {
            Thread.currentThread().interrupt();
        }
    }
    
    /**
     * MULTI-THREADING: Stop method
     */
    public void stop() {
        System.out.println("Stopping " + processorName);
        running = false;
    }
    
    public boolean isRunning() {
        return running;
    }
}
