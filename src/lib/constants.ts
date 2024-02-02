export const STATUS_LIST = ['online', 'offline', 'not-login']
export const STATUS_COLOR_LIST = ['#009900', '#ffa500', '#990000']
export type FILTER_NAME = '' | 'Location' | 'Firm' | 'Status' | 'Type' | 'Lead' | 'Advanced Search' | 'Clear Filters' | 'Contact' | 'Suitability Score'
export const STAGES = ['outreach', 'deck request', 'meeting request', 'dd', 'passes']

export const FIRM_NAMES = [
  '10D',
  '1315 Capital',
  '1flourish Capital',
  '20/20 HealthCare Partners',
  '3M Ventures',
  '3B Future Health Ventures',
  '3H Health Investment',
  '3T Invest',
  '4BIO Capital',
  '4See Ventures',
  '5AM Ventures',
  '6 Dimensions Capital',
  'Fifty Years',
  '415 CAPITAL',
  '1315 Capital',
  'AB Magnitude Ventures Group',
  'Abbey Road Capital',
  'AbbVie Ventures',
  'Abingworth',
  'Able Partners',
  'Accelmed Ventures',
  'Accelerator Life Science Partners',
  'Ackermans & van Haaren',
  'Active Impact Investments',
  'Adara Ventures',
  'AdBio partners',
  'Addition',
  'Aditum Bio',
  'Adjuvant Capital',
  'Adjacent Venture Capital',
  'AFI Capital Partners',
  'Advent Life Sciences',
  'AlbionVC',
  'Aglaia Oncology Funds',
  'Alignment Ventures',
  'Ahren Innovation Capital',
  'Ally Bridge Group',
  'AJU IB Investment',
  'Almeda Ventures',
  'ALSA Ventures',
  'Altitude Ventures',
  'Altitude Life Science Ventures',
  'Altium Capital Management',
  'Amgen Ventures',
  'aMoon Fund',
  'Amplitude Ventures',
  'AMR Action Fund',
  'Amzak Health',
  'Andera Partners',
  'Animatrix Capital',
  'Aphelion Capital',
  'Apollo Health Ventures',
  'Arboretum Ventures',
  'ARCH Venture Partners\n',
  'Arix Bioscience',
  'Arkin Holdings',
  'Artfo Holdings',
  'ARTIS Ventures',
  'Asabys Partners',
  'Asahi Kasei Corporate Venture Capital',
  'ASAJES Ventures',
  'Ascension Ventures',
  'Ascend Venture Capital (Seattle)\n',
  'Astellas Venture Management',
  'August Capital',
  'AV8 Ventures',
  'Avanteca Partners',
  'Avego Management',
  'AXA Investment Managers',
  'Avestria Ventures',
  'Axial (San Francisco)',
  'Bain Capital Life Sciences',
  'Barda Ventures',
  'Barwell',
  'Bay Bridge Ventures',
  'Bandera Partners',
  'Bavarian Capital Management',
  'BASF Venture Capital',
  'Bay City Capital',
  'Baird Capital',
  'B Capital Group',
  'Bioengine Capital',
  'Bioqube Ventures',
  'Bios Partners',
  'Biomatics Capital',
  'Bilgola Capital',
  'Berkeley Catalyst Fund',
  'Bioscience Managers',
  'BioStar Capital',
  'Biobrit',
  'BioMedPartners',
  'Beyond Next Ventures',
  'BioTrack Capital',
  'BioAdvance',
  'Blackbird Ventures',
  'Beringea',
  'Bessemer Venture Partners',
  'Borski Fund',
  'Breakout Ventures',
  'Breakout Labs',
  'Brighteye Ventures',
  'Bonaventure Capital',
  'Borealis Ventures',
  'Boehringer Ingelheim Venture Fund',
  'Boxer Capital',
  'Blackhorn Ventures',
  'Blackstone Life Sciences',
  'Blue Horizon Corporation',
  'bp Ventures',
  'Blumberg Capital',
  'Brightlands Venture Partners',
  'Broadview Ventures',
  'Builders VC',
]

export const LOCATION_LIST = [
  'Israel',
  'United States',
  'Luxembourg',
  'Hong Kong',
  'Sweden',
  'United Kingdom',
  'Switzerland',
  'China',
  'Germany',
  'Belgium',
  'Canada',
  'Spain',
  'France',
  'Netherlands',
  'South Korea',
  'Mexico',
  'Japan',
  'Australia',
]

export const TYPE_LIST = [
  'Venture Capital',
  'Private Equity',
  'Public Investment',
  'Individual',
  'Corporate',
  'Debt',
]

export const SECTOR_LIST = [
  'Life and Health Insurance',
  'IT Consulting and Outsourcing',
  'Business/Productivity Software',
  'Computers, Parts and Peripherals',
  'Clinics/Outpatient Services',
  'Multimedia and Design Software',
  'Financial Software',
  'Educational Software',
  'Systems and Information Management',
  'Monitoring Equipment',
  'Electronic Equipment and Instruments',
  'Specialty Chemicals',
  'Pharmaceuticals',
  'Distributors (Healthcare)',
  'Personal Products',
  'Laboratory Services (Healthcare)',
  'BPO/Outsource Services',
  'Medical Supplies',
  'Therapeutic Devices',
  'Surgical Devices',
  'Buildings and Property',
  'Specialty Retail',
  'Software Development Applications',
  'Decision/Risk Analysis',
  'Real Estate Services (B2C)',
  'Diagnostic Equipment',
  'Outcome Management (Healthcare)',
  'Biotechnology',
  'Drug Discovery',
  'Electrical Equipment',
  'Automotive',
  'Application Specific Semiconductors',
  'Medical Records Systems',
  'Household Appliances',
  'Energy Storage',
  'Media and Information Services (B2B)',
  'Machinery (B2B)',
  'General Purpose Semiconductors',
  'Electronics (B2C)',
  'Enterprise Systems (Healthcare)',
  'Education and Training Services (B2B)',
  'Internet Retail',
  'Aerospace and Defense',
  'Entertainment Software',
  'Clothing',
  'Alternative Energy Equipment',
  'Drug Delivery',
  'Beverages',
  'Accessories',
  'Publishing',
  'Home Furnishings',
  'Restaurants and Bars',
  'Holding Companies',
  'Network Management Software',
  'Social/Platform Software',
  'Construction and Engineering',
  'Building Products',
  'Hospitals/Inpatient Services',
  'Discovery Tools (Healthcare)',
  'Private Equity',
  'Logistics',
  'Practice Management (Healthcare)',
  'Marine',
  'Multi-line Chemicals',
  'Food Products',
  'Environmental Services (B2B)',
  'Connectivity Products',
  'Consulting Services (B2B)',
  'Automation/Workflow Software',
  'Agricultural Chemicals',
  'Leisure Facilities',
  'Social Contect',
  'Elder and Disabled Care',
  'Educational and Training Services (B2C)',
  'Department Stores',
  'Information Services (B2C)',
  'Movies, Music and Entertainment',
  'Broadcasting, Radio and Television',
  'Distributors/Wholesale',
  'Telecommunications Service Providers',
  'National Banks',
  'International Banks',
  'Energy Production',
  'Industrial Chemicals',
  'Brokerage',
  'Energy Infrastructure',
  'Raw Materials (Non-Wood)',
  'Cultivation',
  'Iron and Steel Mining',
  'Plastic Containers & Packaging',
  'Application Software',
  'Wireless Communications Equipment',
  'Communication Software',
  'Database Software',
  'Managed Care',
  'Human Capital Services',
  'Operating Systems Software',
  'Legal Services (B2B)',
  'Synthetic Textiles',
  'Internet Software',
  'Fiberoptic Equipment',
  'Paper/Soft Products',
  'Horticulture',
  'Road',
  'Footwear',
  'Hotels and Resorts',
  ' Hotels and Leisure',
  'Investment Banks',
  'Industrial Supplies and Parts',
  'Production (Semiconductors)',
  'Other Services (B2C Non-Financial)',
  'Paper Containers & Packaging',
  'Asset Management',
  'Insurance Brokers',
  'Recreational Goods',
  'Real Estate Investment Trusts (REITs)',
  'Specialized Finance',
  'Air',
  'Other Commercial Services',
  'Printing Services (B2B)',
  'Household Products',
  'Metal Containers & Packaging',
  'Security Services (B2B)',
  'Thrifts and Mortgage Finance',
  'Plant Textiles',
  'Vertical Market Software',
  'Storage (IT)',
  'Special Purpose Acquisition Company (SPAC)',
  'General Merchandise Stores',
  'Consumer Finance',
  'Internet Service Providers',
  'Accounting, Audit and Tax Services (B2B)',
  'Property and Casualty Insurance',
  'Rail',
  'Multi-Utilities',
  'Forestry Development/Harvesting',
  'Movies',
  'Water Utilities',
  'Multi-line Mining',
  'Office Services (B2B)',
  'Precious Metals and Minerals Mining',
  'Animal Husbandry',
  'Wood/Hard Products',
  'Business Equipment and Supplies',
  'Legal Services (B2C)',
  'Regional Banks',
  'Cable Service Providers',
  'Aquaculture',
  'Energy Traders and Brokers',
  'Social Content',
  'Forestry Processing',
  'Commercial Services',
  'Oil and Gas Equipment',
  'Energy Refining',
  'Software',
  'Commercial/Professional Insurance',
]

export const COINVESTORS_LIST = [
  'Pitango Venture Capital',
  '83North',
  'Bessemer Venture Partners',
  'Jibe Ventures',
  'La Maison Partners',
  '3B Scientific',
  '3D Systems',
  'Aisling Capital',
  'Ampersand Capital Partners',
  '3D Ventures',
  'Citigroup Alternative Investments',
  '345 Partners',
  'Alastair Trueger',
  'Altcapital',
  'Amit Bhakta',
  '3Sbio',
  'AARP',
  'AI Capital',
  'Alexandria Real Estate Equities (NYS; ARE)',
  'Alexandria Venture Investments',
  'LRVHealth',
  'Swift Ventures',
  'Tesi',
  '180 Degree Capital (NAS: TURN)',
  '3M',
  'CDP Venture Capital',
  'Claris Ventures',
  'Italian Angels for Growth',
  'Schroders Capital',
  '4basebio UK',
  '3E Bioventures',
  '5Y Capital',
  'Alan Asset Management',
  'Ally Bridge Group',
  'Alwin Capital',
  'Sciety',
  'Krim Talia',
  'Ad Health Media',
  'CNI (Stockholm)',
  'Alexander Stendahl',
  'Abingworth',
  'Arkin Holdings',
  'Deerfield Management',
  'MRL Ventures Fund',
  'Takeda Ventures',
  'Verve Ventures',
  '1to4 Foundation',
  '5M Ventures',
  'ACE & Company',
  'Abir Oreibi',
  'Cormorant Asset Management',
  'F-Prime Capital',
  'Janus Henderson Investors (NYS: JHG)',
  'RA Capital Management',
  'ARCH Venture Partners',
  'HBM Healthcare Investments (SWX: HBMN)',
  'The Invus Group',
  'Blue Pool Capital',
  'Y Combinator',
  'Metaplanet Holdings',
  'Soma Capital',
  'Liquid 2 Ventures',
  'Pioneer Fund',
  'MedFocus',
  'AMED Ventures',
  'Accel',
  'Andera Partners',
  'Angel Physicians Fund',
  'Ipsen (Pharmaceuticals) (PAR: IPN)',
  'Sherpa Healthcare Partners',
  'Trinity Innovation Fund',
  'Route 2 Capital Partners',
  'Pfizer Ventures',
  'Atlas Ventures',
  'Citadel Enterprise Americas',
  'Osage University Partners',
  'Omega Funds',
  'G9 Ventures',
  'Alumni Ventures',
  'AlleyCorp',
  'BoxGroup',
  'City Light Capital',
  'Peregrine Ventures',
  'Accelmed',
  'Almeda Ventures (TAE: AMDA)',
  'Consensus Business Group',
  'WRF Capital',
  '7G Bioventures',
  'BioAdvance',
  'Fulmer & Company',
  'BDC Capital',
  'Ontario Centre of Innovation',
  'ArcTern Ventures',
  'Blackhorn Ventures',
  'Benhamou Global Ventures',
  'Inveready Asset Management',
  'Smartech Capital',
  'Wayra',
  'Amadeus Capital Partners',
  'Bpifrance',
  'Asabys Partners',
  'Boehringer Ingelheim Venture Fund',
  'Invivo Capital',
  'Medicxi',
  'Tiger Global Management',
  'Coatue Management',
  'GV',
  'Lux Capital',
  'Andreessen Horowitz',
  'Forbion',
  'Motorpharma',
  'Sosei',
  'Uncommon Projects',
  'Singular',
  'Union Square Ventures',
  '10X Capital',
  '14W',
  'Achari Ventures',
  'Argonautic Ventures',
  'HALLEY Venture Partners',
  'Phyto Partners',
  'GreenAxs Capital',
  'Columbus Venture Partners',
  'OrbiMed',
  'Gilde Healthcare',
  'Belinda Termeer',
  'King Arms Yard VCT (LON: KAY)',
  'UCL Technology Fund',
  'UCL Business',
  'University College London',
  'Plug and Play Tech Center',
  'AurorA Science',
  'BioX Biosciences',
  'Inkef',
  'Oost NL',
  'IQ Capital Partners',
  'Jameel Investment Management Co.',
  'OMX Ventures',
  'KB Investment',
  'Korea Development Bank',
  'Korea Investment Partners',
  'Hana Ventures',
  'Mirae Asset Venture Investment',
  'Accelmed Ventures',
  'Triventures',
  'AltalR Capital',
  'Ballad Ventures',
  '3B Future Health Fund',
  'AlbitonVC',
  'Brain Too Free Ventures',
  'British Patient Capital',
  'Caribou Property',
  'Bread & Butter Ventures',
  'Excelerate Health Ventures',
  'AUFI Limited',
  'AXA Venture Partners',
  'Arianna Simpson',
  'Flagship Pioneering',
  'F-Primer Capital',
  'Adage Capital Management',
  'Affinity Asset Advisors',
  'New Enterprise Associates',
  'Merk Global Health Innovation Fund',
  'Sanofi Ventures',
  'BVF Partners',
  'Israel Biotech Fund',
  'Khosla Ventures',
  'Lightspeed Venture Partners Israel',
  'OurCrowd',
  'Fonds de solidarité FTQ',
  'Lumira Ventures',
  'Versant Ventures',
  '50 North Ventures',
  'Atlantic Neptune',
  'AXA Investment Managers',
  'Bill & Melinda Gates Foundation',
  'Aperture Venture Partners',
  'Casdin Capital',
  '123 Investment Managers',
  '21 Invest',
  '3i',
  '3i Group',
  '415 CAPITAL',
  'Evotec (ETR: EVT)',
  'Kent Life Science',
  'NCL Technology Ventures',
  'Novo Holdings',
  'Philips Ventures',
  'Seraph Group',
  'Medvest Capital',
  'ShangBay Capital',
  'Fj Labs',
  'TA Ventures',
  'TruVenturo',
  '4See Ventures',
  '8eyes',
  'Baird Capital',
  'Venture Investors',
  '5AM Ventures',
  'Agilent Technologies (NYS: A)',
  'Beringea',
  'Altitude Life Science Ventures',
  'Lundbeckfonden BioCapital',
  'Arkin Bio-Ventures',
  'LionBird',
  'Pontifax Venture Capital',
  '1/1 Capital',
  '10H Capital',
  '10T Holdings',
  '11:11 Media',
  'Abstract Ventures',
  'Calm Ventures',
  'Civilization Ventures',
  'Gaingels',
  'Sand Hill Angels',
  'Alta Life Sciences',
  'CDTI Innvierte',
  'Sabadell Venture Capital',
  'Ysios Capital',
  'AdBio partners',
  'Asahi Kasei',
  '3x5 Partners',
  'AME Cloud Ventures',
  'Faraday Venture Partners',
  'Terranet Ventures',
  'Delos Capital Partners',
  'Ascension (London)',
  'Madrona Venture Group',
  'Cascade Seed Fund',
  'Cercano Management',
  'Trilogy Equity Partners',
  'Longwood Fund',
  'MPM Capital',
  'Novartis Venture Fund',
  'DCVC',
  'Forerunner Ventures',
  'GreatPoint Ventures',
  'Correlation Ventures',
  'Global Founders Capital',
  'Gokul Rajaram',
  'Greycroft',
  'B-Engine',
  'GF Group Holding',
  'H.Hentsch Asset Management',
  'High-Tech Grunderfonds',
  'AbbVie Ventures',
  'SteelSky Ventures',
  'Astia',
  'Canaan Partners',
  'Dreamers VC',
  '8VC',
  'ARTIS Ventures',
  'Rock Springs Capital',
  'Perceptive Advisors',
  'Scottish Enterprise',
  'Archangel Investors',
  'Gabriel Investment Syndicate',
  'Shancastle Investments',
  'SyndicateRoom',
  'Flexport',
  'Graph Ventures',
  'MCJ Collective',
  'Spacecadet Ventures',
  'Bronfman E.L. Rothschild',
  'Guggenheim Partners',
  'JCP Investment Partners LTD',
  'Mason Street Advisors',
  'Opera Trading Capital',
  'Auden',
  'Baystartup',
  'Blockrocket',
  'HCS Beteiligungsgesellschaft',
  'Minaya Capital',
  'Breakthrough Energy',
  'CITIC Agriculture',
  'Eight Roads',
  'Oriza Holdings',
  'Arix Bioscience (LON: ARIX)',
  'BVCF',
  '500 Global',
  'AAVIN Private Equity',
  'ABS Capital Partners',
  'Peak XV Partners',
  'Acorn Bioventures',
  'Advent Life Sciences',
  'BGF',
  'ExSight Ventures',
  'InFocus Capital Partners',
  '600 Mile Challenge Fund',
  'AJU IB Investment (KRX: 027360)',
  'Acces Biotechnology',
  'Alan Hoops',
  'Berg Capital Group',
  'BinaryZen Ventures',
  'Breakaway Partners (Estonia)',
  'CompassMSP',
  'SVE Capital',
  'Photon Fund',
  'Boutique Venture Partners',
  'Downing Ventures',
  'Ananda Impact Ventures',
  'Andrew Fisher',
  'Abiomed',
  'Bioventus (NAS: BVS)',
  'ALMA Life Sciences',
  'Boxer Capital',
  'Gimv',
  'Mitsubishi UFJ Capital',
  'SMBC Venture Capital',
  'Future Venture Capital (TKS: 8462)',
  'ANRI',
  'HongShan',
  'Qiming Venture Partners',
  'TF Capital',
  'Legend Capital',
  'Ben Franklin Technology Partners of Southeastern Pennsylvania',
  'Gabriel Investments',
  'Newark Venture Partners',
  'Remiges Ventures',
  'Robin Hood Ventures',
  'Icehouse Ventures',
  'Startmate',
  'Skip Capital',
  'Grok Ventures',
  'Possible Ventures',
  'ProVen VCT (LON: PVN)',
  'Michigan Capital Network Ventures',
  'Michigan Rise',
  'Insight Partners',
  'Salesforce Ventures',
  'Rabobank Group',
  '4impact capital',
  'Angel Xu',
  'Anoop Kansupada',
  'Arches Capital',
  'KdT Ventures',
  'Dolby Family Ventures',
  'Asymmetry Ventures',
  '1517 Fund',
  'Alchemist Accelerator',
  'Alicia Holley',
  'JME Venture Capital',
  'Kima Ventures',
  'Mustard Seed Maze',
  'Reach Capital',
  'Benson Capital Partners',
  'Addition',
  'AppHarvest',
  'Arsenal Growth',
  'Carolina Angel Network',
  'Polaris Partners',
  'Sands Capital',
  'Oxford Science Enterprises',
  'Perivoli Innovations Trust',
  'Coparion',
  'Logos Capital',
  'Lorimer Ventures',
  'WND Ventures',
  'Climate Capital',
  'SOSV',
  'CPT Capital',
  'Thia Ventures',
  'Alwyn Capital',
  'Beyond Impact (Montreux)',
  'Aramco Ventures',
  'Chevron Technology Ventures',
  'Energy Innovation Capital',
  'Citigroup (NYS: C)',
  'Engineering Capital',
  'Limburg Business Development Fund',
  'Limburg Development and Investment Company',
  'Future Food Fund',
  'Netherlands Enterprise Agency',
  'ReumaNederland',
  'Long View Equity Partners',
  'Hatteras Venture Partners',
  'Ajax Health',
  'Catalyst Health Ventures',
  'Epidarex Capital',
  '11.2 Capital',
  '1121.vc',
  '1984 Ventures',
  '205 Capital',
  '42CAP',
]