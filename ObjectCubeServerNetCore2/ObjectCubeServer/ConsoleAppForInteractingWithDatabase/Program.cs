﻿using ObjectCubeServer.Models;
using ObjectCubeServer.Models.DataAccess;
using ObjectCubeServer.Models.DomainClasses;
using System;
using System.Linq;

namespace ConsoleAppForInteractingWithDatabase
{
    class Program
    {
        static void Main(string[] args)
        {
            Console.WriteLine("Hello World!");
            JamesWhiteDatasetInserter.InsertJamesWhiteDataset();
            //DeleteAllObjects();
            Console.WriteLine("Done!");
            Console.ReadKey();
        }

        static void InsertObject()
        {
            var anObject = new CubeObject {
                FileType = FileType.Photo,
                ObjectTagRelations = new System.Collections.Generic.List<ObjectTagRelation>() { },
                Photo = new Photo() { }
            };
            using( var context = new ObjectContext())
            {
                context.CubeObjects.Add(anObject);
                context.SaveChanges();
            }
        }

        static void InsertManyToManyObjects()
        {
            //Creating tags:
            var friends = DomainClassFactory.NewTag("Friends");
            var alice = DomainClassFactory.NewTag("Alice");
            var bob = DomainClassFactory.NewTag("Bob");
            
            Tag[] tags = new Tag[] {
                friends,
                alice,
                bob,
            };
            
            //Creating tagset people:
            var people = DomainClassFactory.NewTagSet("People");
            
            //Creating relations:

            
            //Inserting into database:
            using (var context = new ObjectContext())
            {
                context.Tags.AddRange(tags);
                context.Tagsets.Add(people);
                context.SaveChanges();
            }
        }

        static void GetAllObjects()
        {
            using (var context = new ObjectContext())
            {
                var cubeObjects = context.CubeObjects.ToList();
                cubeObjects.ForEach(co => Console.WriteLine(co.Id));
            }
        }

        static void DeleteAllObjects()
        {
            using (var context = new ObjectContext())
            {
                var allCubeObjects = context.CubeObjects.ToList();
                context.CubeObjects.RemoveRange(allCubeObjects);
                context.SaveChanges();
            }
        }
    }
}
