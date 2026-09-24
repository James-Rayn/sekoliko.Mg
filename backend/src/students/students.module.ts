import { Module } from "@nestjs/common";
import { StudentController } from "./students.controller";
import { StudentService } from "./students.service";
import { NotificationsModule } from "src/notifications/notifications.module";

@Module({
    imports: [NotificationsModule, ],
    controllers: [StudentController],
    providers: [StudentService],
    exports: [StudentService],
})
export class StudentsModule {}