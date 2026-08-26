export const industriesConfig = {
  'Power Generation': {
    types: ['Solar', 'Wind', 'Hydro', 'Battery Storage', 'Natural Gas', 'Nuclear', 'Fossil Fuel'],
    count: 1842
  },
  'Power Delivery': {
    types: ['Transmission', 'Distribution', 'Substation', 'HVDC'],
    count: 654
  },
  'Oil & Gas': {
    types: ['LNG Terminal', 'LNG Export', 'Pipeline', 'Oil Production', 'Refinery', 'Carbon Capture'],
    count: 892
  },
  'Hi Tech': {
    types: ['Data Center', 'Chip Manufacturing', 'Semiconductor', 'Manufacturing'],
    count: 425
  },
  'Life Sciences': {
    types: ['Pharmaceutical', 'Biotech', 'Manufacturing', 'Research'],
    count: 168
  },
  'Water Infrastructure': {
    types: ['Treatment', 'Distribution', 'Infrastructure', 'Desalination'],
    count: 0  // Will be populated from data
  }
}

export const capacityBands = [
  { label: 'Under 100 MW', value: '0-100' },
  { label: '100–250 MW', value: '100-250' },
  { label: '250–500 MW', value: '250-500' },
  { label: '500 MW–1 GW', value: '500-1000' },
  { label: '1 GW+', value: '1000-' }
]

export const stages = ['Permitting', 'Announced', 'Under Construction', 'Approved']

export const states = [
  { label: 'Texas', value: 'TX', count: 1524 },
  { label: 'California', value: 'CA', count: 826 },
  { label: 'Illinois', value: 'IL', count: 342 },
  { label: 'New York', value: 'NY', count: 287 },
  { label: 'Ohio', value: 'OH', count: 256 }
]
