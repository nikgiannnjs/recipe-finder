exports.numberOfIngs = async (
  firstIng,
  secondIng,
  thirdIng,
  fourthIng,
  fifthIng
) => {
  let sumFirstIng, sumSecondIng, sumThirdIng, sumFourthIng, sumFifthIng;

  if (!firstIng) {
    sumFirstIng = 0;
  } else {
    sumFirstIng = 1;
  }

  if (!secondIng) {
    sumSecondIng = 0;
  } else {
    sumSecondIng = 1;
  }

  if (!thirdIng) {
    sumThirdIng = 0;
  } else {
    sumThirdIng = 1;
  }

  if (!fourthIng) {
    sumFourthIng = 0;
  } else {
    sumFourthIng = 1;
  }

  if (!fifthIng) {
    sumFifthIng = 0;
  } else {
    sumFifthIng = 1;
  }

  const sum =
    sumFirstIng + sumSecondIng + sumThirdIng + sumFourthIng + sumFifthIng;

  return sum;
};
