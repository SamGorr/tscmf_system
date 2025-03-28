
# Background 

ADB’s Trade and Supply Chain Finance Program (TSCFP)  aims to make global trade and supply chains inclusive, green, resilient, transparent, and socially responsible. TSCFP fills market gaps by providing guarantees and loans through partner banks in support of trade. ADB’s Microfinance Program (MFP) is an unfunded credit enhancement and a risk allocation tool for partner financial institutions (PFIs), designed to address a market gap and promote local currency lending to microfinance institutions (MFIs)/ nonbank financial institutions (NBFIs). ADB primarily risk shares with PFIs which provide wholesale loans  to MFIs and/or NBFIs to expand their access to local currency funding and address the financial needs of their micro borrower clients.

TSCFP and MFP transactions and business volume are expected to continue growing over the next few years. The existing transaction management platform, Trade Finance Program Monitoring System (TFPMS), is not flexible enough to fit evolving needs of the business.  ADB is embarking on a Trade, Supply Chain, and Microfinance Management Platform (TSCMF) Project that will deliver a fit-for-purpose, integrated solution that can support trade finance, supply chain finance, and microfinance transactions. ADB is now looking to work with a vendor to develop and manage a solution for ADB, leveraging modern interoperable architecture aligned with ADB’s Enterprise Architecture Strategy. The solution shall have a product workflow system (called transaction orchestrator or TO) with business logic and service call management functionalities. The TO will call on various discrete services to perform the required transactions.

# Functional Requirements Document (FRD)


- **Event 1: Inquiry (Request for quote)** – PFIs or Obligors can request a quote well in advance of the actual transaction request. The reason this is an important event is because if the Trade and Supply Chain Department (TSCD) and Microfinance Program (MFP) confirms the request with pricing and limit availability, it deems this transaction 'committed' for future utilization and hence reserves or earmarks the limit rendering it unavailable for other transactions. Hence this event needs to be treated in a similar manner to an actual transaction request and it undergoes the same steps as a transaction request. The following services are called upon by the TO at the inquiry stage:
    
    - Email Extract Service: Processes client email contents to extract relevant data fields for transaction processing.
        
    - File Extract Service: Parses structured files coming from email or SWIFT to extract relevant data fields for transaction processing.
        
    - Pricing Service: Checks for the appropriate indicative pricing for a transaction based on a pricing matrix and returns the result to TO.
        
    - Sanctions Service: Executes the Sanctions Screening Service to screen for all entities involved in a transaction based on available data, and returns the result to the TO.
        
    - Eligibility Check Service: Executes eligibility checks on transaction attributes such as goods, entities, etc. against various eligibility checklists at a transactional level and checks for obligor facility expiry data and covenant status and returns the results to TO.
        
    - Limit Management Service: Invoke the Limit Management service for facility limits (inner and outer limits) checks. The service shall also handle maintenance and management of limit types, limit amounts, and other limit information.
        
    - RDA Booking Engine: Invoke the RDA Booking Engine Service (in the absence of sufficient ORM-approved limits to support the transaction inquiry) for available limits/caps on the obligor and outstanding details and return it to TO to calculate available headroom (considering pipeline transactions) for the RDA investor to support the residual transactional amount.
        
    - Exposure Management Services: Invoke the Exposure Services for applicable Program Caps, Country Caps, Sector Caps, Obligor Concentration Cap, PFI cap. The service shall also handle maintenance and management of exposure/cap types, amounts, and other exposure/caps information.
        
    - TO validation and transaction approval: Simultaneously, TO validates the results received from all the services above and either accepts the outcome or presents it to the manual queue for review and business decision (in case of negative outcome or failed status in one of the checks).
        
    - Transaction Processing and document storage: Post receiving approval of the transaction inquiry within TO, the system instructs the various services to record the transaction and receives confirmation of the same:
        
        - TO instructs Limit Management Service to earmark the ORM facility utilization with the transaction amounts
        - TO instructs the RDA booking engine to earmark the RDA facility for the residual amount
        - Generate an Inquiry Reference number
        - TO generates a response to be sent to the client via email quoting the reference no, transaction details, pricing and period of validity for accepting the quote

- **Event 2: Transaction Request** – this is the actual transaction request from the client. For each transaction request, it is important to check for an inquiry reference number since that implies earmarked limits and an agreed price (if applicable). In the absence of an inquiry reference number, TO treats it as a fresh transaction and repeats all the service checks as above
    
    - Email Extract Service
    - File Extract Service
    - Pricing (not needed if inquiry reference number exists)
    - Sanctions Screening Service
    - Eligibility check service
    - Limits Management Service (not needed if inquiry reference number exists)
    - RDA Booking Service (not needed if inquiry reference number exists)
    - Exposure Management Service
    - TO validation and transaction approval
    - Transaction processing and document storage:
        - TO instructs Limit Management Service to update the facility utilization with the transaction amount. If an inquiry reference number exists, then the Service will reverse the earmarking and replace with drawdown
        - TO instructs Exposure Management Service to update exposure utilizations with the transaction amounts
        - TO instructs the RDA booking engine to book the RDA facility for the required amount. If an inquiry reference number exists, then the Service will reverse the earmarking and replace with drawdown
        - TO instructs the Accounting Service to book the transaction
        - TO instructs the Treasury service to fund transaction (for funded products)
        - TO instructs the DMS service to book the transaction documents

- **Event 3: Transaction amendment** – this follows the same steps as the transaction request event with similar checks and may not be applicable to all products e.g., RCF and FRPA will not have amendments
    
    - Email Extract Service
    - File Extract Service
    - Pricing
    - Sanctions Screening Service
    - Eligibility check service
    - Limits Management Service
    - RDA Booking Engine Service
    - Exposure Management Service
    - TO validation and transaction approval
    - Transaction processing and document storage
    
- **Event 4: RDA process** – TSCD Middle Office has the option to exercise a stand-alone selldown that can be invoked during an obligor portfolio review to ensure sufficient availability to accommodate future transactions. Transactions will be prioritized for selldown based on pre-agreed rules with the RDA Decision Engine Service. These prioritized transactions will be offered to the MO for a final decision. The selected transactions will go through relevant checks as below
    
    - Email Extract Service
    - File Extract Service
    - Pricing – this check is against any conditions set by the RDA investor for pricing
    - Sanctions Screening Service
    - Eligibility check service
    - Limits Management Service – specifically on RDA approved limits and the counterparty limits on RDA investor
    - RDA Booking Engine Service
    - Exposure Management Service – this includes all the RDA approved caps and program caps for respective RDA investors
    - TO validation and transaction approval
    - Transaction processing and document storage – this entails releasing the ORM limits and replacing it with RDA limits and updating the respective Services
        
        - TO instructs Limit Management Service to update the facility utilization with the selldown amount
        - TO instructs Exposure Management Service to update exposure utilizations with the selldown amounts
        - TO instructs the RDA booking engine to book the RDA facility for the selldown amount.
    
- **Event 5: Closure of transaction** – refers to closure of transaction on the expiry/ maturity date of the transaction
    
    - During transaction closure:
        
        - TO instructs Limit Management Service to release limits and update utilization with transaction amount
        - TO instructs Exposure Management Service to release exposure and update exposure utilizations with the transaction amounts
        - TO instructs the RDA booking engine to release RDA facility for the required amount and update utilization
        - TO instructs the Accounting Service to cancel the transaction
        - TO instructs the Treasury service to break the funded transaction and provide breakage costs (for funded products)
        - TO instructs the DMS service to book the transaction documents
        - TO triggers SWIFT Service to send messages to counterparties confirming closure of transaction

# TSCFP and MFP Products Introduction

## Trade Finance

- **Credit Guarantee (CG)** – ADB issues a guarantee in favor of participating Confirming Banks (CB) to guarantee the payment obligations of approved Issuing Banks (IB). The guarantee issuance is disclosed to the Issuing Bank.
- **Revolving Credit Facility (RCF)** – ADB directly provides funding to approved IBs (borrowing banks) to support underlying trade transactions.
- **Unfunded Risk Participation Agreement (URPA)** – ADB participates on an unfunded basis in a portfolio of transactions originated by pre-approved Issuing Banks and offered to ADB by Participating Financial Institution (PFIs) on a post facto basis. It is governed by the URPA signed between the PFI and ADB. The primary difference with CG is that i) URPA is a portfolio participation rather than the issuance of a guarantee on a single transaction; ii) the participation is mostly on a post facto basis under a Master Participation Agreement (MPA), unlike under the CG product wherein the guarantee may be issued simultaneous to the underlying trade transaction ; iii) URPA is a bilateral agreement between ADB and PFI and thus, participations may not be disclosed to the IB.
- **Funded Risk Participation Agreement (FRPA)** – Similar to URPA but participation is on a funded basis (i.e., there may be actual disbursements made to support ADB's funded participation).

## Supply Chain

- **Unfunded Risk Participation Agreement (URPA)** – ADB participates on an unfunded basis for a pre-agreed share in a supply chain finance transaction between a PFI and a corporate anchor (Obligor). It is governed by the URPA signed between the PFI and ADB.
- **Partial Guarantee Facility Agreement (PGFA)** – similar to URPA other than it is a tripartite arrangement between ADB, PFI and Obligor for jurisdictions where risk participations are not permitted.
- **Funded Risk Participation Agreement (FRPA)** – ADB participates on a funded basis for a pre-agreed share in a supply chain finance-related loan granted by a PFI to the corporate anchor (Obligor). It is governed by the FRPA signed between the PFI and ADB.

## Microfinance

- **Unfunded Risk Participation Agreement (URPA)** – Similar to Trade Finance, ADB participates (on an unfunded basis) in loans made by the PFIs to Microfinance Institutions (MFIs or Obligors) on a post facto basis.
- **Partial Guarantee Facility Agreement (PGFA)** – ADB issues a commitment to partially guarantee a PFI’s loan to the MFI. The difference with URPA, there is a tripartite arrangement between ADB, PFI and Obligor for jurisdictions where risk participations are not permitted for every guarantee issuance.

## Risk Distribution

- Risk Distribution Agreement (RDA) – An arrangement in which ADB sells down its obligor risk exposures to participating counterparties.
- ADB’s risk distributions are on an unfunded basis and governed by a RDA signed between ADB and the respective RDA counterparties.
- Currently, risk distribution is available for both Trade Finance and Supply Chain businesses across all product solutions.
- Risk distribution can be invoked at a transactional level or during an ad hoc obligor portfolio review to ensure sufficient limit availability to accommodate future transactions.