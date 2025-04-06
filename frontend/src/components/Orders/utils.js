export const orderQueryKeyLookup = {
    'ORDERS': 'tables-orders',
    'QRCODES': 'tables-list-filter',
    'ORDER_DETAILS': 'order-details',
    'SNAPSHOT': 'invoice-snapshot',
}

export const orderStatus = [
    { label: 'Pending', value: 'pending', color: '#fbbf24', className: 'bg-yellow-400' },
    { label: 'Confirmed', value: 'confirmed', color: '#38bdf8', className: 'bg-sky-400' },
    { label: 'Preparing', value: 'preparing', color: '#a78bfa', className: 'bg-violet-400' },
    { label: 'Ready', value: 'ready', color: '#4ade80', className: 'bg-green-400' },
    { label: 'Completed', value: 'completed', color: '#2dd4bf', className: 'bg-teal-400' },
    { label: 'Cancelled', value: 'cancelled', color: '#f87171', className: 'bg-red-400' },
]

export const getColor = (color) => {
    switch (color) {
      case 'pending':
        return 'orange';
      case 'confirmed':
        return 'sky';
      case 'preparing':
        return 'violet';
      case 'ready':
        return 'green';
      case 'completed':
        return 'teal';
      case 'cancelled':
        return 'red';
      default:
        return 'slate';
    }
  }