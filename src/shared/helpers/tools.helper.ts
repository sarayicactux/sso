// import CryptoJS from 'crypto-js';
import axios from 'axios';
import { Injectable } from '@nestjs/common';
import { EventBus } from '@nestjs/cqrs';

// import firebaseAdmin from '../../config/firebase';
import { CreateLogInterface } from '../../modules/admin/domain/interfaces/log/CreateLog.interface';

//events
import { CreateLogEvent } from '../../modules/admin/application/events/log/createLog.event';
import { MimeType } from '../enums/mimeType.enum';

@Injectable()
export class Tools {
  constructor(private readonly eventBus: EventBus) {}
  // static convertToSlug(title: any) {
  //   throw new Error('Method not implemented.');
  // }
  convertToSlug(Text: string) {
    return Text.toLowerCase()
      .replace(/ /g, '-')
      .replace(/-{6}/g, '-')
      .replace(/-{5}/g, '-')
      .replace(/-{4}/g, '-')
      .replace(/-{3}/g, '-')
      .replace(/--/g, '-')
      .replace(/,/g, '')
      .replace(/،/g, '')
      .replace(/#/g, '')
      .replace(/@/g, '')
      .replace(/$/g, '')
      .replace(/!/g, '')
      .replace(/&/g, '')
      .replace(/؟/g, '');
    // .replace(new RegExp('(', 'g'), '')
    // .replace(new RegExp(')', 'g'), '')
    // .replace(new RegExp('"', 'g'), '')
    // .replace(new RegExp("'", 'g'), '')
    // .replace(new RegExp(`/`, 'g'), '')
    // .replace(new RegExp('?', 'g'), '');
  }
  FromInt(str: string) {
    try {
      str = str.toString();
      str = str.replace(/0/g, '۰');
      str = str.replace(/1/g, '۱');
      str = str.replace(/2/g, '۲');
      str = str.replace(/3/g, '۳');
      str = str.replace(/4/g, '۴');
      str = str.replace(/5/g, '۵');
      str = str.replace(/6/g, '۶');
      str = str.replace(/7/g, '۷');
      str = str.replace(/8/g, '۸');
      str = str.replace(/9/g, '۹');
      return str;
    } catch (err) {
      console.log(err);
      return str;
    }
  }
  normalize(text: string) {
    text = text.trim().replace(/ {5}/g, ' ');
    text = text.replace(/ {4}/g, ' ');
    text = text.replace(/ {3}/g, ' ');
    text = text.replace(/ {2}/g, ' ');
    text = text.replace(/ {1}/g, ' ');
    text = text.replace(/,/g, '');
    text = text.replace(/،/g, '');
    text = text.replace(/#/g, '');
    text = text.replace(/@/g, '');
    text = text.replace(/$/g, '');
    text = text.replace(/!/g, '');
    text = text.replace(/&/g, '');
    text = text.replace('(', '');
    text = text.replace(')', '');
    text = text.replace('(', '');
    text = text.replace(')', '');
    text = text.replace(/؟/g, '');
    text = text.replace('?', '');
    text = text.replace('ي', 'ی');
    text = text.replace('ك', 'ک');
    return text;
  }
  toInt(str: string) {
    str = str.replace(/٠/g, '0');
    str = str.replace(/١/g, '1');
    str = str.replace(/٢/g, '2');
    str = str.replace(/٣/g, '3');
    str = str.replace(/٤/g, '4');
    str = str.replace(/٥/g, '5');
    str = str.replace(/٦/g, '6');
    str = str.replace(/٧/g, '7');
    str = str.replace(/٨/g, '8');
    str = str.replace(/٩/g, '9');
    str = str.replace(/۰/g, '0');
    str = str.replace(/۱/g, '1');
    str = str.replace(/۲/g, '2');
    str = str.replace(/۳/g, '3');
    str = str.replace(/۴/g, '4');
    str = str.replace(/۵/g, '5');
    str = str.replace(/۶/g, '6');
    str = str.replace(/۷/g, '7');
    str = str.replace(/۸/g, '8');
    str = str.replace(/۹/g, '9');
    return str;
  }
  checkMime(filename: string) {
    const i = filename.lastIndexOf('.');
    const memeType = filename.substr(i + 1);
    const imgList = ['jpg', 'jpeg', 'png', 'gif', 'JPG', 'JPEG', 'PNG', 'GIF'];
    const videoList = ['mp4', 'MP4'];
    const musicList = ['mp3', 'MP3'];
    const appFile = ['apk', 'exe', 'msi'];
    const docFile = ['pdf', 'doc', 'docx', 'xls', 'xlsx', 'txt', 'ppt', 'pptx'];
    if (imgList.indexOf(memeType) !== -1) {
      return MimeType.IMAGE;
    } else if (videoList.indexOf(memeType) !== -1) {
      return MimeType.VIDEO;
    } else if (appFile.indexOf(memeType) !== -1) {
      return MimeType.APP;
    } else if (musicList.indexOf(memeType) !== -1) {
      return MimeType.MUSIC;
    } else if (docFile.indexOf(memeType) !== -1) {
      return MimeType.DOCUMENT;
    }
    return MimeType.OTHER;
  }
  saveLogs(createLog: CreateLogInterface) {
    try {
      const event = new CreateLogEvent({
        adminId: createLog.adminId,
        tableName: createLog.tableName,
        rowId: createLog.rowId,
        act: createLog.act,
        oldData: createLog.oldData,
        newData: createLog.newData,
        description: createLog.description,
      });
      this.eventBus.publish(event);
    } catch (err) {
      console.error(err);
    }
  }
  codeCreator() {
    return 1234;
    const val = Math.floor(1000 + Math.random() * 8999);
    return val;
  }

  securePassword(passwordLength) {
    const chars =
      '0123456789abcdefghijklmnopqrstuvwxyz!@#$%^&*()ABCDEFGHIJKLMNOPQRSTUVWXYZ';
    let password = '';
    for (let i = 0; i <= passwordLength; i++) {
      const randomNumber = Math.floor(Math.random() * chars.length);
      password += chars[randomNumber];
    }
    return password;
  }
  // encryptObject(object, secretKey) {
  //   return object;
  //   // return CryptoJS.AES.encrypt(JSON.stringify(object), secretKey).toString();
  // }
  // encryptString(str, secretKey) {
  //   return str;
  //   // return CryptoJS.AES.encrypt(str, secretKey).toString();
  // }

  validateMobile(mobile) {
    mobile = mobile.length <= 10 ? `0${mobile}` : mobile;
    if (
      (mobile.indexOf('+98') > -1 &&
        (mobile.length !== 13 ||
          !/^[0-9]+$/.test(mobile.substring(1, mobile.length)))) ||
      (mobile.indexOf('+98') === -1 &&
        (mobile.length !== 11 || !/^[0-9]+$/.test(mobile)))
    ) {
      return false;
    }
    if (
      (mobile.length === 13 && mobile.substring(0, 4) !== '+989') ||
      (mobile.length === 11 && mobile.substring(0, 2) !== '09')
    ) {
      return false;
    }
    mobile = mobile.replace('+989', '09');
    return mobile;
  }
  getPasswordStrength(password) {
    let score = 0;
    const minLength = 8;
    const maxLength = 20;

    // Length check
    if (password.length >= minLength && password.length <= maxLength) {
      score++;
    }

    // Letter case check
    if (/[a-z]/.test(password) && /[A-Z]/.test(password)) {
      score++;
    }

    // Digit check
    if (/\d/.test(password)) {
      score++;
    }

    // Special character check
    if (/[$@!%*?&#]/.test(password)) {
      score++;
    }

    // Common password check
    const commonPasswords = [
      'password',
      '123456',
      'qwerty',
      'abc123',
      '123!@#',
      // Add more common passwords here...
    ];
    if (commonPasswords.includes(password.toLowerCase())) {
      score--;
    }
    // if (!commonPasswords.includes(password.toLowerCase())) {
    //   score++;
    // }

    return score;
  }
  toRad(Value) {
    return (Value * Math.PI) / 180;
  }
  calculateDistance(lat1, lon1, lat2, lon2) {
    const R = 6371; // km
    const dLat = this.toRad(lat2 - lat1);
    const dLon = this.toRad(lon2 - lon1);
    lat1 = this.toRad(lat1);
    lat2 = this.toRad(lat2);

    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.sin(dLon / 2) * Math.sin(dLon / 2) * Math.cos(lat1) * Math.cos(lat2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    const d = R * c;
    return Math.round(d);
  }
  async sendSmsCode(phone, code) {
    return;
    const receptor = phone;
    const template = 'otp';
    const type = 1;
    const apiKey = 'F9ZcpMndriAOTGh3B+zZsoGAbOFuHYNyXcm7m8ZstLE';
    const url = `http://api.iransmsservice.com/v2/send/verify`;

    const data = {
      param1: code,
      receptor,
      template,
      type,
    };
    const config = {
      headers: {
        apikey: apiKey,
        'Content-Type': 'application/x-www-form-urlencoded',
      },
    };
    try {
      const result = await axios.post(url, data, config);

      return result;
    } catch (error) {
      return error;
    }
  }
  sendSms(phone, text) {
    console.log({ phone });

    return;
    const receptor = phone;
    const apiKey = 'F9ZcpMndriAOTGh3B+zZsoGAbOFuHYNyXcm7m8ZstLE';
    const url = `http://api.iransmsservice.com/v2/sms/send/simple`;

    const data = {
      message: text,
      sender: 30004341022066,
      receptor,
    };
    const config = {
      headers: {
        apikey: apiKey,
        'Content-Type': 'application/x-www-form-urlencoded',
      },
    };
    try {
      axios.post(url, data, config);

      return;
    } catch (error) {
      return error;
    }
  }
  async sendBulkSms(phones, text) {
    return;
    const receptor = phones;
    const apiKey = 'F9ZcpMndriAOTGh3B+zZsoGAbOFuHYNyXcm7m8ZstLE';
    const url = `http://api.iransmsservice.com/v2/sms/send/bulk`;

    const data = {
      message: text,
      sender: 30004341022066,
      receptor,
    };
    const config = {
      headers: {
        apikey: apiKey,
        'Content-Type': 'application/x-www-form-urlencoded',
      },
    };
    try {
      const result = await axios.post(url, data, config);

      return result;
    } catch (error) {
      return error;
    }
  }
  // async sendNotification(firebaseToken, title, body) {
  //   try {
  //     const message = {
  //       notification: {
  //         title: title,
  //         body: body,
  //         // link,
  //       },
  //       data: {
  //         url: 'https://edms.popitu.ir/',
  //       },
  //       token: firebaseToken,
  //     };

  //     await firebaseAdmin.messaging().send(message);
  //   } catch (error) {
  //     console.log({ error });
  //     return error;
  //   }
  // }
}
