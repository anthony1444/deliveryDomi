import { OrderService } from './order.service';

describe('OrderService', () => {
  const service: OrderService = new OrderService();

  it('should create', () => {
    expect(service).toBeTruthy();
  });
});
