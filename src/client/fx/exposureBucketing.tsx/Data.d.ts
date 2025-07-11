type ExposureBasicInfo = {
  poNumber: string;
  client: string;
  type: string;
  bu: string;
  details: string;
  date: string;
  currency: string;
  amount: number;
};

type ExposureDetails = {
  advance: number;
  inco: string;
  month1: number;
  month2: number;
  month3: number;
  month4to6: number;
  monthMoreThan6: number;
  remarks: string;
};

type ExposureBucketing = ExposureBasicInfo & ExposureDetails;
