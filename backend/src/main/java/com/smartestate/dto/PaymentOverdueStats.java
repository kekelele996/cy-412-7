package com.smartestate.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class PaymentOverdueStats {
    private BigDecimal overdueAmount;
    private Integer overdueCount;
}
