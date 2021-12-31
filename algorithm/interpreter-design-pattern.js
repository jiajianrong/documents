class Context
{
  format=null;
  date=null;
 
  getFormat()
  {
    return this.format;
  }
 
  setFormat(format)
  {
    this.format = format;
  }
 
  getDate()
  {
    return this.date;
  }
 
  setDate(date)
  {
    this.date = date;
  }
}




class AbstractFormat
{
  execute(context){};
}

class DayFormat extends AbstractFormat
{
  execute(context)
  {
    let format1 = context.getFormat();
    let date = context.getDate();
    let day = date.getDate();
    let tempFormat = format1.replace("DD", day.toString());
    context.setFormat(tempFormat);
  }
}

class MonthFormat extends AbstractFormat
{
  execute(context)
  {
    let format1 = context.getFormat();
    let date = context.getDate();
    let month = date.getMonth()+1;
    let tempFormat = format1.replace("MM", month.toString());
    context.setFormat(tempFormat);
  }
}

class YearFormat extends AbstractFormat
{
  execute(context)
  {
    let format1 = context.getFormat();
    let date = context.getDate();
    let year = date.getYear() + 2000;
    let tempFormat = format1.replace("YYYY", year.toString());
    context.setFormat(tempFormat);
  }
}





class InterpreterDesignPattern
{
 
  static main(formatPatternStr)
  { 
    console.log("Input : " + formatPatternStr);
    
    // STEP 1: 构建上下文对象
    let context = new Context();
    context.setFormat(formatPatternStr);
    context.setDate(new Date());
 
    // STEP2: 分词，将语句拆分为待处理的item数组
    let formatOrderList = InterpreterDesignPattern.getFormatOrder(context);

    // STEP3: 逐个翻译（解释）item
    for( let abstractFormat of formatOrderList )
    {
      abstractFormat.execute(context);
    }
 
    console.log("Output : " + context.getFormat());
  }
  
 
  static getFormatOrder(context)
  {
    let formatOrderList = [];
    let strArray = context.getFormat().split("-");
    for( let string of strArray )
    {
      if( string === "MM" )
      {
        formatOrderList.push(new MonthFormat());
      }
      else if( string === "DD" )
      {
        formatOrderList.push(new DayFormat());
      }
      else
      {
        formatOrderList.push(new YearFormat());
      }
    }
    return formatOrderList;
  }
 
}




InterpreterDesignPattern.main('YYYY-MM-DD');
console.log('-');
InterpreterDesignPattern.main('MM-DD-YYYY');