package com.cryptotrading.exception;

/**
 * Custom Exception class demonstrating EXCEPTION HANDLING
 * Used throughout trading strategies for error management
 */
public class TradingException extends Exception {
    private String errorCode;
    private String errorDetails;
    
    // Constructor with message only
    public TradingException(String message) {
        super(message);
    }
    
    // Constructor with message and cause
    public TradingException(String message, Throwable cause) {
        super(message, cause);
    }
    
    // Constructor with error code and details
    public TradingException(String errorCode, String message, String errorDetails) {
        super(message);
        this.errorCode = errorCode;
        this.errorDetails = errorDetails;
    }
    
    // Getters
    public String getErrorCode() {
        return errorCode;
    }
    
    public String getErrorDetails() {
        return errorDetails;
    }
    
    @Override
    public String toString() {
        if (errorCode != null) {
            return String.format("TradingException [%s]: %s - %s", 
                errorCode, getMessage(), errorDetails);
        }
        return super.toString();
    }
}
