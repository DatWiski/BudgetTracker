package com.example.budgettracker.service;

import com.example.budgettracker.dto.BillRequest;
import com.example.budgettracker.model.AppUser;
import com.example.budgettracker.model.Bill;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

public interface BillService {

  Bill saveBillForUser(BillRequest billRequest, AppUser user);

  Bill updateBillForUser(Long billId, BillRequest billRequest, AppUser user);

  void deleteBillForUser(Long billId, AppUser user);

  /** Returns all bills that belong to the given user. */
  java.util.List<Bill> getBillsForUser(AppUser user);

  /** Returns paginated bills that belong to the given user. */
  Page<Bill> getBillsForUser(AppUser user, Pageable pageable);
}
