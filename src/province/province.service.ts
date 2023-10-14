import { PaginationQuery } from '@/common/dto/pagination.dto';
import { PaginatedReturn } from '@/common/interceptor/paginate.interceptor';
import { getDBProviderFeatures } from '@/common/utils/db';
import { PrismaService } from '@/prisma/prisma.service';
import { RegencyService } from '@/regency/regency.service';
import { SortOptions, SortService } from '@/sort/sort.service';
import { Injectable } from '@nestjs/common';
import { Province, Regency } from '@prisma/client';
import { ProvinceFindQueries } from './province.dto';

@Injectable()
export class ProvinceService {
  readonly sorter: SortService<Province>;

  constructor(
    private readonly prisma: PrismaService,
    private readonly regencyService: RegencyService,
  ) {
    this.sorter = new SortService<Province>({
      sortBy: 'code',
      sortOrder: 'asc',
    });
  }

  async find(
    options?: ProvinceFindQueries,
  ): Promise<PaginatedReturn<Province>> {
    return this.prisma.paginator({
      model: 'Province',
      args: {
        ...(options?.name && {
          where: {
            name: {
              contains: options.name,
              ...(getDBProviderFeatures()?.filtering?.insensitive && {
                mode: 'insensitive',
              }),
            },
          },
        }),
        ...((options?.sortBy || options?.sortOrder) && {
          orderBy: this.sorter.object({
            sortBy: options?.sortBy,
            sortOrder: options?.sortOrder,
          }),
        }),
      },
      paginate: { limit: options?.limit, page: options?.page },
    });
  }

  async findByCode(code: string): Promise<Province | null> {
    return this.prisma.province.findUnique({
      where: {
        code: code,
      },
    });
  }

  /**
   * Find all regencies in a province.
   * @param provinceCode The province code.
   * @param options The options.
   * @returns An array of regencies, `[]` if there are no match province.
   * @deprecated Use `RegencyService.find` instead.
   */
  async findRegencies(
    provinceCode: string,
    options?: SortOptions<Regency> & PaginationQuery,
  ): Promise<PaginatedReturn<Regency>> {
    const { sortBy, sortOrder, page, limit } = options ?? {};

    return this.prisma.paginator({
      model: 'Regency',
      args: {
        where: { provinceCode },
        orderBy: this.regencyService.sorter.object({ sortBy, sortOrder }),
      },
      paginate: { page, limit },
    });
  }
}
