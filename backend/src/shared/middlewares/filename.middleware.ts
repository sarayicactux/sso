const normalize = (text: string) => {
  text = text.replace(/ {5}/g, ' ');
  text = text.replace(/ {4}/g, ' ');
  text = text.replace(/ {3}/g, ' ');
  text = text.replace(/ {2}/g, ' ');
  text = text.replace(/ {1}/g, ' ');
  text = text.replace(/,/g, '');
  text = text.replace(/،/g, '');
  text = text.replace(/#/g, '');
  text = text.replace(/@/g, '');
  text = text.replace(/$/g, '');
  text = text.replace(/!/g, '');
  text = text.replace(/&/g, '');
  text = text.replace('(', '');
  text = text.replace(')', '');
  text = text.replace('(', '');
  text = text.replace(')', '');
  text = text.replace(/؟/g, '');
  text = text.replace('?', '');
  return text;
};
export const editFileName = (req, file, callback) => {
  if (!req) throw new Error();
  const name = normalize(file.originalname.split('.')[0]);

  const fileExtName = file.originalname.substring(
    file.originalname.lastIndexOf('.'),
    file.originalname.length,
  );
  const randomName = Math.floor(1000000 + Math.random() * 8999999);
  callback(null, `${name}-${randomName}${Date.now()}-${fileExtName}`);
};
