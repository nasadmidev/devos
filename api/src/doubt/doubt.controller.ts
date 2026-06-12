import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Put,
  Query,
  Req,
} from '@nestjs/common';
import { DoubtService } from './doubt.service';
import {
  CreateDoubtDTO,
  ListDoubtQueryDTO,
  SelectDoubtQueryDTO,
  UpdateDoubtDTO,
} from './doubt.dto';
import { Public } from '@/auth/jwt/public.decorator';
import { selectTransformer } from '@/common/transformers/select.transformer';
import { UuidValidatorPipe } from '@/common/pipes/uuid-validator/uuid-validator.pipe';
import type { RequestAuthorized } from '@/auth/auth.service';

@Controller('doubt')
export class DoubtController {
  constructor(private readonly service: DoubtService) {}

  @Public()
  @Get('all')
  async findAllDoubts(@Query() query: ListDoubtQueryDTO) {
    const select = query.select ? selectTransformer(query.select) : undefined;
    return this.service.findAll({ ...query, select });
  }

  @Public()
  @Get(':id')
  async findOneDoubt(
    @Param('id', UuidValidatorPipe) id: string,
    @Query() query: SelectDoubtQueryDTO,
  ) {
    const select = query.select ? selectTransformer(query.select) : undefined;
    return this.service.findOne(id, select);
  }

  @Post()
  async createDoubt(
    @Req() req: RequestAuthorized,
    @Body() data: CreateDoubtDTO,
  ) {
    return this.service.create(req.user.sub, data);
  }

  @Put(':id')
  async updateDoubt(
    @Param('id', UuidValidatorPipe) id: string,
    @Req() req: RequestAuthorized,
    @Body() data: UpdateDoubtDTO,
  ) {
    return this.service.update({ id, authorId: req.user.sub, data });
  }

  @Delete(':id')
  async deleteDoubt(
    @Param('id', UuidValidatorPipe) id: string,
    @Req() req: RequestAuthorized,
  ) {
    const { role, sub } = req.user;
    return this.service.delete({ id, authorId: sub, role });
  }
}
