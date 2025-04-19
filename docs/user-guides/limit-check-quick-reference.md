# Limit Check Quick Reference Guide

## Overview
The enhanced Limit Check feature provides improved impact analysis for transactions against Country and Entity limits. This guide explains how to interpret the limit check results and use them to make informed decisions.

## Important Notes
- For all limit impact calculations, the system uses the transaction's **Covered Amount (USD)** rather than the total transaction amount
- This means the displayed impact analysis reflects the guaranteed portion of the transaction
- The UI continues to refer to this as "Transaction Amount" in the display
- Available limit calculations use the **Gross Available Limit** (without considering earmarked amounts)
- Post-transaction available amounts also use gross available limit for calculation
- Both gross and net available limits (with earmark subtracted) are displayed for reference

## Accessing Limit Checks
1. Navigate to the Transaction creation workflow
2. Complete the required transaction details
3. Proceed to the "Limit Check" step in the workflow
4. The system automatically performs impact analysis on applicable limits

## Understanding Country Limit Checks

### Key Metrics
- **Country Limit**: Maximum exposure allowed for the selected country
- **Current Utilization**: Amount already utilized against the country limit
- **Transaction Amount**: Amount of the current transaction
- **Post-Transaction Utilization**: Current utilization + transaction amount
- **Post-Transaction Available**: Country limit - post-transaction utilization

### Utilization Bars
- The utilization bars visually indicate the percentage of limit used
- Color coding indicates risk level:
  - **Green**: <50% utilized (low risk)
  - **Yellow**: 50-80% utilized (moderate risk)
  - **Red**: >80% utilized (high risk)

## Understanding Entity Limit Checks

### Entity-Level Summary
- **Entity**: The Issuing Bank entity for the transaction
- **Total Limit**: Maximum exposure allowed for the entity
- **Current Utilization**: Amount already utilized against the entity limit
- **Post-Transaction Utilization**: Current utilization + transaction amount
- **Post-Transaction Available**: Entity limit - post-transaction utilization

### Facility-Level Details
- Only facilities that exactly match the transaction's product type are displayed
- Product matching uses the transaction's sub_limit_type and requires an exact match (not a substring match)
- Each facility displays:
  - Facility name and type
  - Facility limit amount
  - Current utilization amount and percentage
  - Post-transaction utilization amount and percentage
  - Utilization bars with color coding

## Making Decisions

### Low Risk (Green)
- Proceeding with the transaction is unlikely to cause any limit concerns
- Future transactions will still have significant available headroom

### Moderate Risk (Yellow)
- Consider the necessity of the transaction
- Be aware that future transactions may push utilization into high-risk territory
- Consult with Risk Management if uncertain

### High Risk (Red)
- Transaction may exceed or come very close to exceeding limits
- A warning message will appear for exceedances
- Consider alternatives:
  - Reducing transaction amount
  - Waiting for other transactions to mature
  - Requesting a temporary limit increase

## No Matching Facilities
If you see "No facility limits found that exactly match the transaction's product type" message:
- The transaction's product type doesn't exactly match any facilities for the entity
- The system requires an exact match between the transaction's sub_limit_type and the facility limit
- Consult with Credit Administration to establish appropriate facilities or adjust the product type

## Tips
- Review both Country and Entity impact before proceeding
- Pay attention to both the overall entity limit and individual facility limits
- Use the visual indicators (colors and bars) for quick risk assessment
- Consider the timing of other pending transactions not yet reflected in the system 