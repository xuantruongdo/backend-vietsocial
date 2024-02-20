import { MailerService } from '@nestjs-modules/mailer';
import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { SoftDeleteModel } from 'soft-delete-plugin-mongoose';
import { generateConfirmationCode } from 'src/helpers/generateConfirmationCode';
import { User, UserDocument } from 'src/users/entities/user.entity';

@Injectable()
export class MailService {
  constructor(
    private mailerService: MailerService,
    @InjectModel(User.name) private userModel: SoftDeleteModel<UserDocument>,
  ) {}

  async sendConfirmationEmail(email: string, fullname: string) {
    const confirmationCode = generateConfirmationCode();

    await this.userModel.findOne({ email }).updateOne({ confirmationCode });

    return await this.mailerService.sendMail({
      to: email,
      from: '"Support VietSocial" <dev.doxuantruong@gmail.com>',
      subject: 'Welcome to VietSocial App! Confirm your Email',
      template: 'active',
      context: {
        fullname,
        confirmationCode,
      },
    });
  }
}
