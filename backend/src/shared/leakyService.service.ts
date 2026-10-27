import { Injectable, OnModuleInit } from '@nestjs/common';

@Injectable()
export class LeakyService implements OnModuleInit {
  private leakyStore: any[] = [];

  onModuleInit() {
    setInterval(() => {
      console.log('LeakyService is running...................................');
      const bigArray = new Array(1000000).fill('test memory leak');
      this.leakyStore.push(bigArray);

      console.log('Stored arrays:', this.leakyStore.length);
    }, 1000);
  }
}
//node --inspect --max-old-space-size=150 dist/main.js

// عدد 150 مگابایت حافظه برای برنامه در نظر می‌گیرد
// می‌توانید این مقدار را بر اساس نیاز خود تنظیم کنید
// سپس با استفاده از ابزارهای توسعه‌دهنده مرورگر یا ابزارهای دیگر می‌توانید وضعیت حافظه برنامه را بررسی کنید.
