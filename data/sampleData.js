const orders = {
    products_1: {
    amount: 1000,
    currency: 'TWD',
    packages: [
      {
        id: 'products_1',
        amount: 1000,
        products: [
          {
            name: '產品1',
            quantity: 1,
            price: 1000
          }
        ]
      }
    ]
  },
  products_2: {
    amount: 2000,
    currency: 'TWD',
    packages: [
      {
        id: 'products_2',
        amount: 2000,
        products: [
          {
            name: '產品2',
            quantity: 2,
            price: 2000
          }
        ]
      }
    ]
  }
};


module.exports = orders;