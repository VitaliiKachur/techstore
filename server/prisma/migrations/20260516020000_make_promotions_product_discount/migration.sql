UPDATE "Promotion"
SET "type" = 'PRODUCT_DISCOUNT',
    "minQuantity" = 1;

ALTER TABLE "Promotion"
ALTER COLUMN "type" SET DEFAULT 'PRODUCT_DISCOUNT';
