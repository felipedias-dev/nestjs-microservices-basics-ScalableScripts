import { Controller, Get, Param, Post } from '@nestjs/common';
import { HttpService } from '@nestjs/common/http/http.service';
import { EventPattern } from '@nestjs/microservices';
import { ProductService } from './product.service';

@Controller('products')
export class ProductController {
  constructor(
    private productService: ProductService,
    private httpService: HttpService,
  ) {}

  @Get()
  async all() {
    return this.productService.all();
  }

  @Post(':id/like')
  async like(@Param('id') id: number) {
    const product = await this.productService.findOne(id);

    this.httpService
      .post(`http://localhost:5000/api/products/${id}/like`, {})
      .subscribe((response) => console.log(response.data));

    await this.productService.update(id, { likes: ++product.likes });

    return product;
  }

  @EventPattern('product_created')
  async productCreated(data: any) {
    const product = {
      id: data.id,
      title: data.title,
      image: data.image,
      likes: data.likes,
    };

    await this.productService.create(product);
  }

  @EventPattern('product_updated')
  async productUpdated(data: any) {
    const product = {
      id: data.id,
      title: data.title,
      image: data.image,
      likes: data.likes,
    };

    await this.productService.update(product.id, product);
  }

  @EventPattern('product_deleted')
  async productDeleted(id: number) {
    await this.productService.delete(id);
  }
}
