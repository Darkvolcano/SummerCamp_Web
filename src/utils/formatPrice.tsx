export const getFormattedPrice = (price: string | number): string => {
  const priceStr = typeof price === "number" ? price.toString() : price;
  const integerPart = parseFloat(priceStr.split(".")[0]).toLocaleString();
  return `${integerPart}đ`;
};
