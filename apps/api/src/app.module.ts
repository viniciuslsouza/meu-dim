import { Controller, Get, Module } from "@nestjs/common";

@Controller()
class AppController {
  @Get()
  getHello(): string {
    return "Hello World";
  }
}

@Module({
  controllers: [AppController]
})
export class AppModule {}
