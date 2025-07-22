# BudgetTracker Pivot

**Vision**

BudgetTracker aims to become an all-in-one personal finance companion. Building on SubTracker’s solid subscription tracking foundation, it will expand to cover every facet of budgeting – from day-to-day expenses to long-term financial goals – while retaining the elegant UI and privacy-first philosophy users love.

**Planned Module Layout**

```
backend/          Spring Boot microservices (auth, subscriptions, transactions)
ui-react/         React front-end application (SPA) using TypeScript
mobile/           React Native mobile clients (future)
infra/            Terraform + GitHub Actions for cloud deployment & CI
```  

**Historical Reference**

This pivot begins from tag `v1.0-subtracker`, marking the last stable SubTracker release before the transition. 