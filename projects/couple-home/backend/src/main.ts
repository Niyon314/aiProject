import { NestFactory } from '@nestjs/core'
import { ValidationPipe } from '@nestjs/common'
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger'
import { ConfigService } from '@nestjs/config'
import { AppModule } from './app.module'
import { NestExpressApplication } from '@nestjs/platform-express'
import { join } from 'path'

async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(AppModule)

  // 启用 CORS
  app.enableCors({
    origin: true,
    credentials: true,
  })

  // 静态文件服务（上传的照片）
  app.useStaticAssets(join(process.cwd(), 'uploads'), {
    prefix: '/uploads/',
  })

  // 全局验证管道
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
    }),
  )

  // Swagger 文档
  const configService = app.get(ConfigService)
  const config = new DocumentBuilder()
    .setTitle('情侣小家 API')
    .setDescription('情侣小家后端 API 文档')
    .setVersion('1.0')
    .addBearerAuth()
    .build()
  
  const document = SwaggerModule.createDocument(app, config)
  SwaggerModule.setup('api/docs', app, document)

  const port = configService.get('PORT') || 3000
  await app.listen(port)
  
  console.log(`🚀 应用启动在 http://localhost:${port}`)
  console.log(`📚 API 文档：http://localhost:${port}/api/docs`)
  console.log(`📸 上传文件目录：http://localhost:${port}/uploads/moments/`)
}

bootstrap()
