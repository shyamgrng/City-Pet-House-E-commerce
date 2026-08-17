import { Controller, Get, Param, Query } from "@nestjs/common";
import { ContentService } from "./content.service";

@Controller()
export class ContentController {
  constructor(private readonly content: ContentService) {}

  @Get("brands")
  brands() {
    return this.content.brands();
  }

  @Get("testimonials")
  testimonials() {
    return this.content.testimonials();
  }

  @Get("blog-posts")
  blogPosts(@Query("limit") limit?: string) {
    return this.content.blogPosts(limit ? Number(limit) : undefined);
  }

  @Get("services")
  services() {
    return this.content.services();
  }

  @Get("services/:id")
  service(@Param("id") id: string) {
    return this.content.service(id);
  }
}
