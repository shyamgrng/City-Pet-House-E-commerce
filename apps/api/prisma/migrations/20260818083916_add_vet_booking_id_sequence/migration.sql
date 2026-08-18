-- CreateTable
CREATE TABLE "VetBookingIdSequence" (
    "id" INTEGER NOT NULL DEFAULT 1,
    "nextVal" INTEGER NOT NULL DEFAULT 0,

    CONSTRAINT "VetBookingIdSequence_pkey" PRIMARY KEY ("id")
);
