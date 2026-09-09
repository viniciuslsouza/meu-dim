import { Controller, Get, Module } from "@nestjs/common";

import { PrismaModule } from "./prisma/prisma.module";

@Controller()
class AppController {
  @Get()
  getHello(): string {
    return "Hello World";
  }
}

@Module({
  imports: [PrismaModule],
  controllers: [AppController]
})
export class AppModule {}
