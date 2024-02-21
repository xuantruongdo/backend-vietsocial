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

  async sendConfirmationEmail(email: string) {
    const user = await this.userModel.findOne({ email });

    const confirmationCode = generateConfirmationCode();

    await user.updateOne({ confirmationCode });

    return await this.mailerService.sendMail({
      to: email,
      from: '"Support VietSocial" <dev.doxuantruong@gmail.com>',
      subject: 'Welcome to VietSocial App! Confirm your Email',
      template: 'active',
      context: {
        fullname: user.fullname,
        confirmationCode,
      },
    });
  }

  async sendNewPassword(email: string, newPassword: string) {
    const user = await this.userModel.findOne({ email });
    return await this.mailerService.sendMail({
      to: email,
      from: '"Support VietSocial" <dev.doxuantruong@gmail.com>',
      subject: 'Your new password',
      template: 'password',
      context: {
        fullname: user.fullname,
        newPassword,
      },
    });
  }
}
