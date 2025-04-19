# Limit Check Enhancement Test Plan

## Test Scope
This test plan covers the enhanced Limit Check functionality for transaction impact analysis, focusing on the product-specific filtering and improved impact analysis displays.

## Test Environment
- Test environment: Staging
- Browser: Chrome/Firefox/Edge (latest versions)
- User roles: Credit Analyst, Risk Manager

## Test Cases

### 1. Country Limit Check Impact Analysis Display

| Test ID | Description | Steps | Expected Results | Status |
|---------|-------------|-------|------------------|--------|
| CL-01 | Verify Country Limit display includes transaction amount | 1. Navigate to transaction creation<br>2. Fill required fields<br>3. Proceed to Limit Check step | Transaction amount is displayed in Country Limit section | |
| CL-02 | Verify post-transaction utilization calculation | 1. Create transaction<br>2. Check post-transaction utilization in Country Limit section | Post-transaction utilization = Current Utilization + Transaction Amount | |
| CL-03 | Verify post-transaction available calculation | 1. Create transaction<br>2. Check post-transaction available in Country Limit section | Post-transaction available = Country Limit - Post-transaction Utilization | |
| CL-04 | Verify utilization bars display correct percentages | 1. Create transaction<br>2. Check utilization bars in Country Limit section | Current and post-transaction bars show correct utilization percentages | |
| CL-05 | Verify color coding of utilization bars | 1. Create transaction with different amounts<br>2. Check utilization bars | <50%: Green<br>50-80%: Yellow<br>>80%: Red | |

### 2. Entity Limit Check Filtering

| Test ID | Description | Steps | Expected Results | Status |
|---------|-------------|-------|------------------|--------|
| EL-01 | Verify only Issuing Bank entity is displayed | 1. Create transaction with Issuing Bank<br>2. Proceed to Limit Check step | Only the selected Issuing Bank entity appears in Entity Limit section | |
| EL-02 | Verify product-specific facility filtering | 1. Create LC transaction<br>2. Check facility limits | Only LC-related facilities are displayed | |
| EL-03 | Verify product matching with sub_limit_type | 1. Create transaction with specific product<br>2. Check facility limits | Only facilities matching transaction's sub_limit_type are shown | |
| EL-04 | Verify "No matching facilities" message | 1. Create transaction with product that has no matching facilities<br>2. Check facility limits | "No matching facilities for [product]" message is displayed | |

### 3. Entity Limit Impact Analysis Display

| Test ID | Description | Steps | Expected Results | Status |
|---------|-------------|-------|------------------|--------|
| EL-05 | Verify entity-level impact analysis metrics | 1. Create transaction<br>2. Check entity section | Total limit, current utilization, post-transaction utilization and available amounts are displayed | |
| EL-06 | Verify facility-level impact analysis metrics | 1. Create transaction<br>2. Check facility table | Each facility shows current and post-transaction utilization | |
| EL-07 | Verify facility utilization bars | 1. Create transaction<br>2. Check facility table | Each facility has current and post-transaction utilization bars with correct percentages | |

### 4. Edge Cases and Error Handling

| Test ID | Description | Steps | Expected Results | Status |
|---------|-------------|-------|------------------|--------|
| EC-01 | Verify handling when country has no limit set | 1. Create transaction for country with no limit<br>2. Check Country Limit section | "No country limit defined" message is displayed | |
| EC-02 | Verify handling when entity has no limit set | 1. Create transaction for entity with no limit<br>2. Check Entity Limit section | "No entity limit defined" message is displayed | |
| EC-03 | Verify handling of transaction amount exceeding available limit | 1. Create transaction exceeding country/entity limit<br>2. Check Limit sections | Red indicators shown for exceeded limits<br>Warning message displayed | |

## Regression Tests

| Test ID | Description | Steps | Expected Results | Status |
|---------|-------------|-------|------------------|--------|
| RT-01 | Verify Program Limit Check still functions | 1. Create transaction<br>2. Check Program Limit section | Program limit analysis displays correctly | |
| RT-02 | Verify overall transaction approval flow | 1. Complete transaction with limit checks<br>2. Submit for approval | Transaction can be submitted and approved normally | |

## Test Data Requirements
- At least one country with defined limits
- At least one entity with multiple facility limits of different product types
- Transaction amounts that trigger different utilization levels (low, medium, high)

## Acceptance Criteria
- All country limit impact analysis metrics display correctly
- Entity limit checks only show the Issuing Bank entity
- Only facilities matching the transaction's product type are displayed
- All utilization bars correctly represent utilization percentages
- Color coding of utilization bars is consistent and accurate
- All edge cases are handled gracefully with appropriate messages 