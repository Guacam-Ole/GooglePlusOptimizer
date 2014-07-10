using System;
using System.Collections.Generic;
using System.IO;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace dir2json
{
    class Program
    {
        static void Main(string[] args)
        {
            Dir2Json(args[0]);
        }

        

        private static void Dir2Json(string path)
        {
            DirectoryInfo dir=new DirectoryInfo(path);
            string retval = "[";
            foreach (var file in dir.GetFiles("*.*",SearchOption.AllDirectories))
            {
                retval+=string.Format("\"{0}\",", file.FullName.Replace(path, string.Empty));
            }
            retval = retval.Substring(0, retval.Length - 1) + "]";
            Console.WriteLine(retval);
        }
    }
}
