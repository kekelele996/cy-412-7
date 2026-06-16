package com.smartestate.mapper;

import com.baomidou.mybatisplus.core.mapper.BaseMapper;
import com.smartestate.entity.Payment;
import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Select;

import java.math.BigDecimal;

@Mapper
public interface PaymentMapper extends BaseMapper<Payment> {

    @Select("SELECT COALESCE(SUM(amount), 0) FROM payments WHERE status = 'overdue' OR (status = 'unpaid' AND due_date IS NOT NULL AND due_date < NOW())")
    BigDecimal sumOverdueAmount();

    @Select("SELECT COUNT(*) FROM payments WHERE status = 'overdue' OR (status = 'unpaid' AND due_date IS NOT NULL AND due_date < NOW())")
    Integer countOverdue();
}
