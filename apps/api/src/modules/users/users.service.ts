import {
  Injectable,
  NotFoundException
} from "@nestjs/common";

import { PrismaService } from "../../prisma/prisma.service";
import {
  type SafeUser,
  safeUserSelect
} from "./safe-user";
import type { UpdateUserDto } from "./dto/update-user.dto";

@Injectable()
export class UsersService {
  constructor(private readonly prisma: PrismaService) {}

  async findById(id: string): Promise<SafeUser> {
    const user = await this.prisma.user.findUnique({
      where: { id },
      select: safeUserSelect
    });

    if (!user) {
      throw new NotFoundException("Usuário não encontrado");
    }

    return user;
  }

  async update(id: string, dto: UpdateUserDto): Promise<SafeUser> {
    await this.findById(id);

    return this.prisma.user.update({
      where: { id },
      data: {
        ...(dto.name !== undefined ? { name: dto.name.trim() || null } : {})
      },
      select: safeUserSelect
    });
  }

  async exportData(id: string): Promise<object> {
    const data = await this.prisma.user.findUnique({
      where: { id },
      select: {
        ...safeUserSelect,
        statements: {
          include: {
            transactions: true
          }
        },
        debts: true,
        payoffPlans: true,
        payments: true
      }
    });

    if (!data) {
      throw new NotFoundException("Usuário não encontrado");
    }

    const {
      statements,
      debts,
      payoffPlans,
      payments,
      ...user
    } = data;

    return {
      user,
      statements,
      debts,
      payoffPlans,
      payments
    };
  }

  async deleteAccount(id: string): Promise<void> {
    await this.findById(id);
    await this.prisma.user.delete({ where: { id } });
  }
}
