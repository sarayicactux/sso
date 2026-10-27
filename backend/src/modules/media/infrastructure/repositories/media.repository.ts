import { Injectable } from '@nestjs/common';

import { Media } from '../../domain/entities/media.entity';
import { MediaRepositoryImpl } from '../../domain/repositories/media.repository';
import { PrismaService } from '../../../../prisma/prisma.service';
import { CreateMediaDTO } from '../../presentation/dtos/media.dto';

@Injectable()
export class MediaRepository implements MediaRepositoryImpl {
  constructor(private readonly prisma: PrismaService) {}
  async findById(id: number): Promise<Media | null> {
    const media = await this.prisma.findByUnique('media', {
      where: { id },
    });
    return media as Media | null;
  }

  async create(data: CreateMediaDTO): Promise<Media> {
    try {
      const newMedia = await this.prisma.media.create({
        data,
      });
      return newMedia as Media;
    } catch (error) {
      // console.log(error);
      return null;
    }
  }

  async updateMediaOwner(
    ownerId: number,
    ownerModel: string,
    id: number,
  ): Promise<boolean> {
    await this.prisma.media.update({
      where: { id },
      data: {
        ownerId,
        ownerModel,
      },
    });
    return true;
  }
  async delete(id: number): Promise<boolean> {
    await this.prisma.media.delete({
      where: { id },
    });
    return true;
  }
}
