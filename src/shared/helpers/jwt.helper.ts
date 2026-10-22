import * as jwt from 'jsonwebtoken';

export class Jwt {
  private get secretKey(): string {
    const secret = process.env.secretKey;
    if (!secret) {
      throw new Error('Missing env: secretKey');
    }
    return secret;
  }

  private get algorithm(): jwt.Algorithm {
    return (process.env.algorithm || 'HS256') as jwt.Algorithm;
  }

  private get defaultExpiresIn(): string | number {
    return process.env.expiresIn || '18000';
  }

  signer(tokenValues: any, expiresIn: string | number | null = null) {
    const token = jwt.sign(tokenValues, this.secretKey, {
      algorithm: this.algorithm,
      expiresIn: (expiresIn ??
        this.defaultExpiresIn) as jwt.SignOptions['expiresIn'],
    });
    return token;
  }

  verifier(token: string) {
    try {
      const tokenValues = jwt.verify(token, this.secretKey);
      return tokenValues;
    } catch (e) {
      console.log('token verify error', e);
      return false;
    }
  }
}
