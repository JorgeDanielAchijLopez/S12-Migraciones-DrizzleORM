ALTER TABLE "productos" ADD COLUMN "categoria" varchar(60) DEFAULT 'General' NOT NULL;--> statement-breakpoint
ALTER TABLE "productos" ADD COLUMN "activo" boolean DEFAULT true NOT NULL;