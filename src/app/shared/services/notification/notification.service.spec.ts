import { NotificationService } from './notification.service';

describe('NotificationService', () => {
  const service: NotificationService = new NotificationService();

  it('should create', () => {
    expect(service).toBeTruthy();
  });
});
