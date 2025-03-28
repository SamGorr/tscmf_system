// Mock transaction data with consistent reference numbers and detailed information
export const MOCK_TRANSACTION_DATA = [
  { 
    id: 1, 
    reference_number: 'TRX-2023-00001',
    source: 'Email',
    client_id: 1,
    client_name: 'Global Traders Inc.',
    client_country: 'USA',
    client_address: '123 Trade Avenue, New York, NY 10001',
    client_type: 'CORPORATE',
    risk_rating: 'A',
    used_limit: '1,500,000',
    approved_limit: '5,000,000',
    product_id: 1,
    product_name: 'Invoice Financing',
    event_type: 'NEW',
    status: 'Transaction Booked',
    currency: 'USD',
    amount: 250000,
    goods_list: [
      { name: 'Computing Hardware', quantity: '1000', unit: 'pcs' },
      { name: 'Networking Equipment', quantity: '500', unit: 'pcs' },
      { name: 'Cloud Servers', quantity: '200', unit: 'pcs' }
    ],
    industry: 'Technology',
    created_at: '2023-01-15T10:30:00Z',
    request_date: '2023-01-15T10:30:00Z',
    approval_date: '2023-01-18T14:25:00Z',
    type: 'Request',
    maturity_date: '2023-07-15',
    pricing_rate: 5.75,
    notes: 'Client requested expedited processing',
    sanctions_check_passed: true,
    eligibility_check_passed: true,
    limits_check_passed: true,
    exposure_check_passed: true,
    entities: [
      {
        id: '1',
        type: 'Issuing Bank',
        name: 'Global Traders Inc.',
        country: 'USA',
        address: '123 Trade Avenue, New York, NY 10001'
      },
      {
        id: '2',
        type: 'Confirming Bank',
        name: 'Asian Development Corp',
        country: 'Singapore',
        address: '50 Raffles Place, Singapore 048623'
      },
      {
        id: '3',
        type: 'Importer',
        name: 'Tech Solutions Ltd',
        country: 'Japan',
        address: '1-7-1 Konan, Minato-ku, Tokyo, Japan'
      },
      {
        id: '4',
        type: 'Supplier',
        name: 'Global Hardware Supplies',
        country: 'Taiwan',
        address: '88 Dunhua North Road, Taipei, Taiwan'
      }
    ]
  },
  { 
    id: 2, 
    reference_number: 'TRX-2023-00002',
    source: 'File',
    client_id: 3,
    client_name: 'African Farmers Cooperative',
    client_country: 'Kenya',
    client_address: '45 Agriculture Road, Nairobi, Kenya',
    client_type: 'SME',
    risk_rating: 'B',
    used_limit: '250,000',
    approved_limit: '1,000,000',
    product_id: 2,
    product_name: 'Warehouse Receipt Financing',
    event_type: 'NEW',
    status: 'Pending Review',
    currency: 'EUR',
    amount: 75000,
    goods_list: [
      { name: 'Coffee Beans', quantity: '20', unit: 'tonnes' },
      { name: 'Macadamia Nuts', quantity: '5', unit: 'tonnes' },
      { name: 'Avocados', quantity: '10', unit: 'tonnes' }
    ],
    industry: 'Agriculture',
    created_at: '2023-01-26T14:45:00Z',
    request_date: '2023-01-26T14:45:00Z',
    type: 'Inquiry',
    maturity_date: '2023-06-26',
    pricing_rate: 6.25,
    notes: 'Seasonal financing for harvest period',
    sanctions_check_passed: null,
    eligibility_check_passed: null,
    limits_check_passed: null,
    exposure_check_passed: null,
    entities: [
      {
        id: '1',
        type: 'Issuing Bank',
        name: 'Kenya Commercial Bank',
        country: 'Kenya',
        address: '55 Banking Street, Nairobi, Kenya'
      },
      {
        id: '2',
        type: 'Importer',
        name: 'European Gourmet Foods',
        country: 'France',
        address: '24 Rue de Commerce, Paris, France'
      },
      {
        id: '3',
        type: 'Supplier',
        name: 'African Farmers Cooperative',
        country: 'Kenya',
        address: '45 Agriculture Road, Nairobi, Kenya'
      }
    ]
  },
  { 
    id: 3, 
    reference_number: 'TRX-2023-00003',
    source: 'Manual',
    client_id: 2,
    client_name: 'Eastern Suppliers Ltd.',
    client_country: 'China',
    client_address: '88 Manufacturing Blvd, Shanghai, China',
    client_type: 'CORPORATE',
    risk_rating: 'A-',
    used_limit: '3,000,000',
    approved_limit: '4,000,000',
    product_id: 4,
    product_name: 'Import Loan',
    event_type: 'NEW',
    status: 'Viability Check Failed - Limit',
    currency: 'USD',
    amount: 500000,
    goods_list: [
      { name: 'Industrial Machinery', quantity: '5', unit: 'units' },
      { name: 'Manufacturing Equipment', quantity: '2', unit: 'units' },
      { name: 'Automation Systems', quantity: '10', unit: 'units' }
    ],
    industry: 'Manufacturing',
    created_at: '2023-02-18T09:15:00Z',
    request_date: '2023-02-18T09:15:00Z',
    type: 'Request',
    maturity_date: '2023-08-18',
    pricing_rate: 7.0,
    notes: 'Facility expansion financing',
    sanctions_check_passed: true,
    eligibility_check_passed: true,
    limits_check_passed: false,
    exposure_check_passed: true,
    entities: [
      {
        id: '1',
        type: 'Issuing Bank',
        name: 'Bank of China',
        country: 'China',
        address: '1 Finance Street, Beijing, China'
      },
      {
        id: '2',
        type: 'Confirming Bank',
        name: 'US Trade Bank',
        country: 'United States',
        address: '100 Wall Street, New York, NY 10005'
      },
      {
        id: '3',
        type: 'Importer',
        name: 'Eastern Suppliers Ltd.',
        country: 'China',
        address: '88 Manufacturing Blvd, Shanghai, China'
      },
      {
        id: '4',
        type: 'Supplier',
        name: 'German Precision Machinery',
        country: 'Germany',
        address: '42 Engineering Strasse, Munich, Germany'
      }
    ]
  },
  { 
    id: 4, 
    reference_number: 'TRX-2023-00004',
    source: 'Email',
    client_id: 5,
    client_name: 'European Distribution Network',
    client_country: 'Germany',
    client_address: '36 Logistics Park, Hamburg, Germany',
    client_type: 'CORPORATE',
    risk_rating: 'AA',
    used_limit: '2,000,000',
    approved_limit: '7,500,000',
    product_id: 3,
    product_name: 'Export Credit Insurance',
    event_type: 'NEW',
    status: 'Viability Check Successes',
    currency: 'GBP',
    amount: 125000,
    goods_list: [
      { name: 'Pharmaceuticals', quantity: '10', unit: 'tonnes' },
      { name: 'Medical Equipment', quantity: '5', unit: 'tonnes' },
      { name: 'Laboratory Supplies', quantity: '2', unit: 'tonnes' }
    ],
    industry: 'Healthcare',
    created_at: '2023-02-20T11:00:00Z',
    request_date: '2023-02-20T11:00:00Z',
    approval_date: '2023-02-23T16:25:00Z',
    type: 'Request',
    maturity_date: '2023-08-20',
    premium_rate: 2.5,
    notes: 'COVID-19 related medical supplies',
    sanctions_check_passed: true,
    eligibility_check_passed: true,
    limits_check_passed: true,
    exposure_check_passed: true,
    entities: [
      {
        id: '1',
        type: 'Issuing Bank',
        name: 'Deutsche Bank',
        country: 'Germany',
        address: '12 Banking Strasse, Frankfurt, Germany'
      },
      {
        id: '2',
        type: 'Confirming Bank',
        name: 'Royal Bank of Scotland',
        country: 'United Kingdom',
        address: '36 Edinburgh Ave, Edinburgh, Scotland'
      },
      {
        id: '3',
        type: 'Importer',
        name: 'NHS Procurement',
        country: 'United Kingdom',
        address: '100 Healthcare Blvd, London, UK'
      },
      {
        id: '4',
        type: 'Supplier',
        name: 'European Distribution Network',
        country: 'Germany',
        address: '36 Logistics Park, Hamburg, Germany'
      }
    ]
  },
  { 
    id: 5, 
    reference_number: 'TRX-2023-00005',
    source: 'File',
    client_id: 4,
    client_name: 'South American Exporters',
    client_country: 'Brazil',
    client_address: '237 Export Avenue, São Paulo, Brazil',
    client_type: 'CORPORATE',
    risk_rating: 'B+',
    used_limit: '2,750,000',
    approved_limit: '3,000,000',
    product_id: 5,
    product_name: 'Supply Chain Finance',
    event_type: 'NEW',
    status: 'Transaction Rejected',
    currency: 'USD',
    amount: 350000,
    goods_list: [
      { name: 'Soybeans', quantity: '10', unit: 'tonnes' },
      { name: 'Coffee', quantity: '5', unit: 'tonnes' },
      { name: 'Sugar', quantity: '2', unit: 'tonnes' },
      { name: 'Beef', quantity: '1', unit: 'tonnes' }
    ],
    industry: 'Agriculture',
    created_at: '2023-02-28T16:30:00Z',
    request_date: '2023-02-28T16:30:00Z',
    type: 'Cancellation',
    maturity_date: '2023-08-28',
    pricing_rate: 5.5,
    notes: 'Environment risk assessment failed',
    sanctions_check_passed: true,
    eligibility_check_passed: false,
    limits_check_passed: true,
    exposure_check_passed: true,
    entities: [
      {
        id: '1',
        type: 'Issuing Bank',
        name: 'Banco do Brasil',
        country: 'Brazil',
        address: '66 Finance District, São Paulo, Brazil'
      },
      {
        id: '2',
        type: 'Confirming Bank',
        name: 'Citibank',
        country: 'United States',
        address: '388 Greenwich St, New York, NY 10013'
      },
      {
        id: '3',
        type: 'Importer',
        name: 'Global Food Distributors',
        country: 'United States',
        address: '45 Food Processing Lane, Chicago, IL 60007'
      },
      {
        id: '4',
        type: 'Supplier',
        name: 'South American Exporters',
        country: 'Brazil',
        address: '237 Export Avenue, São Paulo, Brazil'
      }
    ]
  },
  { 
    id: 6, 
    reference_number: 'TRX-2023-00006',
    source: 'Manual',
    client_id: 1,
    client_name: 'Global Traders Inc.',
    client_country: 'USA',
    client_address: '123 Trade Avenue, New York, NY 10001',
    client_type: 'CORPORATE',
    risk_rating: 'A',
    used_limit: '1,750,000',
    approved_limit: '5,000,000',
    product_id: 2,
    product_name: 'Warehouse Receipt Financing',
    event_type: 'NEW',
    status: 'Transaction Booked',
    currency: 'USD',
    amount: 180000,
    goods_list: [
      { name: 'Server Hardware', quantity: '50', unit: 'units' },
      { name: 'Networking Switches', quantity: '20', unit: 'units' },
      { name: 'Storage Arrays', quantity: '10', unit: 'units' }
    ],
    industry: 'Technology',
    created_at: '2023-03-10T09:20:00Z',
    request_date: '2023-03-10T09:20:00Z',
    approval_date: '2023-03-12T16:35:00Z',
    type: 'Request',
    maturity_date: '2023-09-10',
    pricing_rate: 6.25,
    notes: 'Datacenter expansion project',
    sanctions_check_passed: true,
    eligibility_check_passed: true,
    limits_check_passed: true,
    exposure_check_passed: true,
    entities: [
      {
        id: '1',
        type: 'Issuing Bank',
        name: 'Global Traders Inc.',
        country: 'USA',
        address: '123 Trade Avenue, New York, NY 10001'
      },
      {
        id: '2',
        type: 'Confirming Bank',
        name: 'Development Bank of Singapore',
        country: 'Singapore',
        address: '12 Marina Boulevard, Singapore 018982'
      },
      {
        id: '3',
        type: 'Importer',
        name: 'Pacific Data Solutions',
        country: 'Australia',
        address: '78 Technology Park, Sydney, Australia'
      },
      {
        id: '4',
        type: 'Supplier',
        name: 'Enterprise Hardware Corp',
        country: 'Japan',
        address: '3-5 Akihabara, Tokyo, Japan'
      }
    ]
  },
  { 
    id: 7, 
    reference_number: 'TRX-2023-00007',
    source: 'Email',
    client_id: 2,
    client_name: 'Eastern Suppliers Ltd.',
    client_country: 'China',
    client_address: '88 Manufacturing Blvd, Shanghai, China',
    client_type: 'CORPORATE',
    risk_rating: 'A-',
    used_limit: '3,200,000',
    approved_limit: '4,000,000',
    product_id: 3,
    product_name: 'Export Credit Insurance',
    event_type: 'NEW',
    status: 'Viability Check Failed - Exposure',
    currency: 'EUR',
    amount: 220000,
    goods_list: [
      { name: 'Textile Machinery', quantity: '10', unit: 'units' },
      { name: 'Industrial Looms', quantity: '5', unit: 'units' },
      { name: 'Sewing Automation', quantity: '15', unit: 'units' }
    ],
    industry: 'Textile Manufacturing',
    created_at: '2023-03-15T14:30:00Z',
    request_date: '2023-03-15T14:30:00Z',
    type: 'Request',
    premium_rate: 2.5,
    notes: 'Factory modernization project - rejected due to exposure limits',
    sanctions_check_passed: true,
    eligibility_check_passed: true,
    limits_check_passed: true,
    exposure_check_passed: false,
    entities: [
      {
        id: '1',
        type: 'Issuing Bank',
        name: 'Bank of China',
        country: 'China',
        address: '1 Finance Street, Beijing, China'
      },
      {
        id: '2',
        type: 'Importer',
        name: 'Italian Fashion House',
        country: 'Italy',
        address: '45 Via della Moda, Milan, Italy'
      },
      {
        id: '3',
        type: 'Supplier',
        name: 'Eastern Suppliers Ltd.',
        country: 'China',
        address: '88 Manufacturing Blvd, Shanghai, China'
      }
    ]
  },
  { 
    id: 8, 
    reference_number: 'TRX-2023-00008',
    source: 'Manual',
    client_id: 3,
    client_name: 'African Farmers Cooperative',
    client_country: 'Kenya',
    client_address: '45 Agriculture Road, Nairobi, Kenya',
    client_type: 'SME',
    risk_rating: 'B',
    used_limit: '300,000',
    approved_limit: '1,000,000',
    product_id: 1,
    product_name: 'Invoice Financing',
    event_type: 'NEW',
    status: 'Pending Review',
    currency: 'USD',
    amount: 85000,
    goods_list: [
      { name: 'Organic Coffee', quantity: '15', unit: 'tonnes' },
      { name: 'Fair Trade Cocoa', quantity: '10', unit: 'tonnes' },
      { name: 'Vanilla Beans', quantity: '2', unit: 'tonnes' }
    ],
    industry: 'Agriculture',
    created_at: '2023-03-22T11:45:00Z',
    request_date: '2023-03-22T11:45:00Z',
    type: 'Inquiry',
    maturity_date: '2023-09-22',
    pricing_rate: 5.75,
    notes: 'Inquiry about financing options for fair trade exports',
    sanctions_check_passed: null,
    eligibility_check_passed: null,
    limits_check_passed: null,
    exposure_check_passed: null,
    entities: [
      {
        id: '1',
        type: 'Issuing Bank',
        name: 'Kenya Commercial Bank',
        country: 'Kenya',
        address: '55 Banking Street, Nairobi, Kenya'
      },
      {
        id: '2',
        type: 'Importer',
        name: 'Ethical Beans Co.',
        country: 'Canada',
        address: '123 Fair Trade Avenue, Vancouver, Canada'
      },
      {
        id: '3',
        type: 'Supplier',
        name: 'African Farmers Cooperative',
        country: 'Kenya',
        address: '45 Agriculture Road, Nairobi, Kenya'
      }
    ]
  },
  { 
    id: 9, 
    reference_number: 'TRX-2023-00009',
    source: 'File',
    client_id: 4,
    client_name: 'South American Exporters',
    client_country: 'Brazil',
    client_address: '237 Export Avenue, São Paulo, Brazil',
    client_type: 'CORPORATE',
    risk_rating: 'B+',
    used_limit: '3,000,000',
    approved_limit: '3,000,000',
    product_id: 4,
    product_name: 'Import Loan',
    event_type: 'NEW',
    status: 'Transaction Booked',
    currency: 'GBP',
    amount: 320000,
    goods_list: [
      { name: 'Mining Equipment', quantity: '3', unit: 'units' },
      { name: 'Excavation Machinery', quantity: '2', unit: 'units' },
      { name: 'Mineral Processing Systems', quantity: '1', unit: 'units' }
    ],
    industry: 'Mining',
    created_at: '2023-04-05T10:15:00Z',
    request_date: '2023-04-05T10:15:00Z',
    approval_date: '2023-04-08T15:20:00Z',
    type: 'Request',
    maturity_date: '2023-10-05',
    pricing_rate: 7.0,
    notes: 'Mining operation expansion in the Amazon region',
    sanctions_check_passed: true,
    eligibility_check_passed: true,
    limits_check_passed: true,
    exposure_check_passed: true,
    entities: [
      {
        id: '1',
        type: 'Issuing Bank',
        name: 'Banco do Brasil',
        country: 'Brazil',
        address: '66 Finance District, São Paulo, Brazil'
      },
      {
        id: '2',
        type: 'Confirming Bank',
        name: 'Barclays Bank',
        country: 'United Kingdom',
        address: '1 Churchill Place, London, UK'
      },
      {
        id: '3',
        type: 'Importer',
        name: 'South American Exporters',
        country: 'Brazil',
        address: '237 Export Avenue, São Paulo, Brazil'
      },
      {
        id: '4',
        type: 'Supplier',
        name: 'British Mining Equipment Ltd.',
        country: 'United Kingdom',
        address: '45 Industrial Way, Sheffield, UK'
      }
    ]
  },
  { 
    id: 10, 
    reference_number: 'TRX-2023-00010',
    source: 'Email',
    client_id: 5,
    client_name: 'European Distribution Network',
    client_country: 'Germany',
    client_address: '36 Logistics Park, Hamburg, Germany',
    client_type: 'CORPORATE',
    risk_rating: 'AA',
    used_limit: '2,250,000',
    approved_limit: '7,500,000',
    product_id: 5,
    product_name: 'Supply Chain Finance',
    event_type: 'NEW',
    status: 'Viability Check Successes',
    currency: 'USD',
    amount: 275000,
    goods_list: [
      { name: 'Electric Vehicles', quantity: '10', unit: 'units' },
      { name: 'EV Charging Equipment', quantity: '50', unit: 'units' },
      { name: 'Battery Systems', quantity: '100', unit: 'units' }
    ],
    industry: 'Automotive',
    created_at: '2023-04-12T16:00:00Z',
    request_date: '2023-04-12T16:00:00Z',
    type: 'Request',
    maturity_date: '2023-10-12',
    pricing_rate: 5.5,
    notes: 'Green transportation initiative for EU markets',
    sanctions_check_passed: true,
    eligibility_check_passed: true,
    limits_check_passed: true,
    exposure_check_passed: true,
    entities: [
      {
        id: '1',
        type: 'Issuing Bank',
        name: 'Deutsche Bank',
        country: 'Germany',
        address: '12 Banking Strasse, Frankfurt, Germany'
      },
      {
        id: '2',
        type: 'Confirming Bank',
        name: 'JPMorgan Chase',
        country: 'United States',
        address: '383 Madison Avenue, New York, NY 10179'
      },
      {
        id: '3',
        type: 'Importer',
        name: 'European Distribution Network',
        country: 'Germany',
        address: '36 Logistics Park, Hamburg, Germany'
      },
      {
        id: '4',
        type: 'Supplier',
        name: 'EV Technologies Inc.',
        country: 'United States',
        address: '1 Innovation Drive, Palo Alto, CA 94304'
      }
    ]
  },
  { 
    id: 11, 
    reference_number: 'TRX-MOCK-12345',
    source: 'Manual',
    client_id: 'CLIENT-001',
    client_name: 'Demo Bank Asia',
    client_country: 'Singapore',
    client_address: '123 Finance Street, Singapore 049320',
    client_type: 'Issuing Bank',
    risk_rating: 'A',
    used_limit: '1,500,000',
    approved_limit: '5,000,000',
    onboard_date: '2023-01-15',
    product_id: 'PRODUCT-001',
    product_name: 'Letter of Credit',
    event_type: 'REQUEST',
    amount: '250000',
    currency: 'USD',
    status: 'SUBMITTED',
    goods_list: [
      { name: 'Electronic Components', quantity: '5000', unit: 'pcs' },
      { name: 'Semiconductor Parts', quantity: '2500', unit: 'pcs' },
      { name: 'Circuit Boards', quantity: '1000', unit: 'pcs' }
    ],
    industry: 'Electronics Manufacturing',
    created_at: new Date().toISOString(),
    request_date: new Date().toISOString(),
    approval_date: null,
    completion_date: null,
    type: 'Request',
    sanctions_check_passed: null,
    eligibility_check_passed: null,
    limits_check_passed: null,
    exposure_check_passed: null,
    entities: [
      {
        id: '1',
        type: 'Issuing Bank',
        name: 'Demo Bank Asia',
        country: 'Singapore',
        address: '123 Finance Street, Singapore 049320'
      },
      {
        id: '2',
        type: 'Confirming Bank',
        name: 'Global Trust Bank',
        country: 'United States',
        address: '789 Banking Ave, New York, NY 10001'
      },
      {
        id: '3',
        type: 'Importer',
        name: 'Tech Import Co.',
        country: 'Vietnam',
        address: '456 Import Boulevard, Ho Chi Minh City, Vietnam'
      },
      {
        id: '4',
        type: 'Supplier',
        name: 'Acme Trading Co.',
        country: 'Vietnam',
        address: '456 Export Road, Ho Chi Minh City, Vietnam'
      }
    ]
  }
];

// Export individual transaction detail for TransactionDetail.js
export const mockTransactionData = {
  id: '1',
  reference_number: 'TRX-MOCK-12345',
  client_id: 'CLIENT-001',
  client_name: 'Demo Bank Asia',
  client_country: 'Singapore',
  client_address: '123 Finance Street, Singapore 049320',
  client_type: 'Issuing Bank',
  risk_rating: 'A',
  used_limit: '1,500,000',
  approved_limit: '5,000,000',
  onboard_date: '2023-01-15',
  product_id: 'PRODUCT-001',
  event_type: 'REQUEST',
  amount: '250000',
  currency: 'USD',
  status: 'SUBMITTED',
  source: 'Manual',
  created_at: new Date().toISOString(),
  entities: [
    {
      id: '1',
      type: 'Issuing Bank',
      name: 'Demo Bank Asia',
      country: 'Singapore',
      address: '123 Finance Street, Singapore 049320'
    },
    {
      id: '2',
      type: 'Confirming Bank',
      name: 'Global Trust Bank',
      country: 'United States',
      address: '789 Banking Ave, New York, NY 10001'
    },
    {
      id: '3',
      type: 'Importer',
      name: 'Tech Import Co.',
      country: 'Vietnam',
      address: '456 Import Boulevard, Ho Chi Minh City, Vietnam'
    },
    {
      id: '4',
      type: 'Supplier',
      name: 'Acme Trading Co.',
      country: 'Vietnam',
      address: '456 Export Road, Ho Chi Minh City, Vietnam'
    }
  ],
  goods_list: [
    { name: 'Electronic Components', quantity: '5000', unit: 'pcs' },
    { name: 'Semiconductor Parts', quantity: '2500', unit: 'pcs' },
    { name: 'Circuit Boards', quantity: '1000', unit: 'pcs' }
  ],
  industry: 'Electronics Manufacturing',
  sanctions_check_passed: null,
  eligibility_check_passed: null,
  limits_check_passed: null,
  exposure_check_passed: null,
  request_date: new Date().toISOString(),
  approval_date: null,
  completion_date: null
}; 