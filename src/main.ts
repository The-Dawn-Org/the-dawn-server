import { NestFactory } from "@nestjs/core";
import { SwaggerModule, DocumentBuilder } from "@nestjs/swagger";
import { AppModule } from "./app.module.js";

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  const config = new DocumentBuilder()
    .setTitle("The Dawn Server API")
    .setDescription("API documentation for the dawn server")
    .setVersion("1.0")
    .addBearerAuth()
    .build();
  const documentFactory = () => SwaggerModule.createDocument(app, config);
  SwaggerModule.setup("api", app, documentFactory);

  const port = process.env.PORT ?? 3000;

  await app.listen(port);
  console.log(`listening on port ${port}🚀`)
}
await bootstrap();
