package com.smartestate.dto;

import lombok.Data;

import java.util.List;

@Data
public class PaymentRemindRequest {
    private List<Long> paymentIds;
}
