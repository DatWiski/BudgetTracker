package com.example.budgettracker.service;

import com.example.budgettracker.dto.BillRequest;
import com.example.budgettracker.exception.BillNotFoundException;
import com.example.budgettracker.model.AppUser;
import com.example.budgettracker.model.Bill;
import com.example.budgettracker.model.Category;
import com.example.budgettracker.repository.BillRepository;
import com.example.budgettracker.util.SecurityUtils;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
public class BillServiceImpl implements BillService {

    private static final String DEFAULT_BILL_CATEGORY = "Bills";
    
    private final BillRepository billRepository;
    private final CategoryService categoryService;
    private final SecurityUtils securityUtils;

    @Override
    @Transactional
    public Bill saveBillForUser(BillRequest request, AppUser user) {
        Bill bill = new Bill();
        bill.setName(request.getName());
        bill.setAmount(request.getAmount());
        bill.setPeriod(request.getPeriod());
        bill.setDueDate(request.getDueDate());
        bill.setActive(request.isActive());
        bill.setAppUser(user);

        // If no category is specified, use the default bill category
        Category category;
        if (request.getCategoryId() != null) {
            category = categoryService.findByIdAndUser(request.getCategoryId(), user);
        } else {
            category = categoryService.findOrCreateCategory(DEFAULT_BILL_CATEGORY, user);
        }
        bill.setCategory(category);

        return billRepository.save(bill);
    }

    @Override
    @Transactional
    public Bill updateBillForUser(Long billId, BillRequest request, AppUser user) {
        Bill bill = billRepository.findById(billId)
                .orElseThrow(() -> new BillNotFoundException(billId));

        securityUtils.validateResourceOwnership(bill.getAppUser(), user, "bill", billId);

        bill.setName(request.getName());
        bill.setAmount(request.getAmount());
        bill.setPeriod(request.getPeriod());
        bill.setDueDate(request.getDueDate());
        bill.setActive(request.isActive());

        if (request.getCategoryId() != null) {
            Category category = categoryService.findByIdAndUser(request.getCategoryId(), user);
            bill.setCategory(category);
        } else {
            // Align with create behavior: use default "Bills" category when none specified
            Category defaultCategory = categoryService.findOrCreateCategory(DEFAULT_BILL_CATEGORY, user);
            bill.setCategory(defaultCategory);
        }

        return billRepository.save(bill);
    }

    @Override
    @Transactional
    public void deleteBillForUser(Long billId, AppUser user) {
        Bill bill = billRepository.findById(billId)
                .orElseThrow(() -> new BillNotFoundException(billId));

        securityUtils.validateResourceOwnership(bill.getAppUser(), user, "bill", billId);

        billRepository.delete(bill);
    }

    @Override
    @Transactional(readOnly = true)
    public java.util.List<Bill> getBillsForUser(AppUser user) {
        // Fetch all bills (active and inactive) that belong to the given user
        return billRepository.findByAppUser(user);
    }
    
    @Override
    @Transactional(readOnly = true)
    public Page<Bill> getBillsForUser(AppUser user, Pageable pageable) {
        return billRepository.findByAppUser(user, pageable);
    }
}