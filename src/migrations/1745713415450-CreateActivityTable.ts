import { MigrationInterface, QueryRunner } from "typeorm";

export class CreateActivityTable1745713415450 implements MigrationInterface {
    name = 'CreateActivityTable1745713415450'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TABLE "activities" ("id" BIGSERIAL NOT NULL, "userId" integer NOT NULL, "name" character varying NOT NULL, "totalTime" integer NOT NULL, "startTime" TIMESTAMP NOT NULL, "type" character varying NOT NULL, CONSTRAINT "PK_7f4004429f731ffb9c88eb486a8" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE INDEX "IDX_5a2cfe6f705df945b20c1b22c7" ON "activities" ("userId") `);
        await queryRunner.query(`CREATE TABLE "users" ("id" SERIAL NOT NULL, "stravaAthleteId" integer NOT NULL, "accessToken" character varying NOT NULL, "refreshToken" character varying NOT NULL, "tokenExpiresAt" TIMESTAMP NOT NULL, CONSTRAINT "UQ_a6844d4faad0ccdc27143407742" UNIQUE ("stravaAthleteId"), CONSTRAINT "PK_a3ffb1c0c8416b9fc6f907b7433" PRIMARY KEY ("id"))`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`DROP TABLE "users"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_5a2cfe6f705df945b20c1b22c7"`);
        await queryRunner.query(`DROP TABLE "activities"`);
    }

}
