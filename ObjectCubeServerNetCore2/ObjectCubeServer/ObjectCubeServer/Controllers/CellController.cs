﻿using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Newtonsoft.Json;
using ObjectCubeServer.Models.DataAccess;
using ObjectCubeServer.Models.DomainClasses;

namespace ObjectCubeServer.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class CellController : ControllerBase
    {
        // EXAMPLES:
        // GET: /api/cell?xAxis={jsonObject}
        // GET: /api/cell?yAxis={jsonObject}
        // GET: /api/cell?zAxis={jsonObject}
        // GET: /api/cell?xAxis={jsonObject}&yAxis={jsonObject}
        // GET: /api/cell?xAxis={jsonObject}&zAxis={jsonObject}
        // GET: /api/cell?yAxis={jsonObject}&zAxis={jsonObject}
        // GET: /api/cell?xAxis={jsonObject}&yAxis={jsonObject}&zAxis={jsonObject}
        public IActionResult Get(string xAxis, string yAxis, string zAxis)
        {
            bool xDefined = xAxis != null;
            bool yDefined = yAxis != null;
            bool zDefined = zAxis != null;
            //Parsing:
            ParsedAxis axisX = xDefined ? JsonConvert.DeserializeObject<ParsedAxis>(xAxis) : null;
            ParsedAxis axisY = yDefined ? JsonConvert.DeserializeObject<ParsedAxis>(yAxis) : null;
            ParsedAxis axisZ = zDefined ? JsonConvert.DeserializeObject<ParsedAxis>(zAxis) : null;
            //Extracting cubeObjects:
            List<List<CubeObject>> xAxisCubeObjects = getAllCubeObjectsFromAxis(xDefined, axisX);
            List<List<CubeObject>> yAxisCubeObjects = getAllCubeObjectsFromAxis(yDefined, axisY);
            List<List<CubeObject>> zAxisCubeObjects = getAllCubeObjectsFromAxis(zDefined, axisZ);
            //Creating Cells:
            List<Cell> cells = new List<Cell>();
            
            if (xDefined && yDefined && zDefined)
            {
                cells =
                    xAxisCubeObjects.SelectMany((colist1, index1) =>
                    yAxisCubeObjects.SelectMany((colist2, index2) =>
                    zAxisCubeObjects.Select((colist3, index3) => new Cell() {
                        x = index1 + 1,
                        y = index2 + 1,
                        z = index3 + 1,
                        CubeObjects = colist1
                            .Where(co => colist2.Exists(co2 => co2.Id == co.Id) && //Where co is in colist2 and in colist3
                            colist3.Exists(co3 => co3.Id == co.Id))
                            .ToList()
                    }))).ToList();
            }
            else if (xDefined && yDefined)
            {
                cells =
                    xAxisCubeObjects.SelectMany((colist1, index1) =>
                    yAxisCubeObjects.Select((colist2, index2) =>
                    new Cell()
                    {
                        x = index1 + 1,
                        y = index2 + 1,
                        z = 0,
                        CubeObjects = colist1
                            .Where(co => colist2.Exists(co2 => co2.Id == co.Id)) //Where co is in colist2 as well
                            .ToList()
                    })).ToList();
            }
            else if (xDefined && zDefined)
            {
                cells =
                    xAxisCubeObjects.SelectMany((colist1, index1) =>
                    zAxisCubeObjects.Select((colist2, index2) =>
                    new Cell()
                    {
                        x = index1 + 1,
                        y = 0,
                        z = index2 + 1,
                        CubeObjects = colist1
                            .Where(co => colist2.Exists(co2 => co2.Id == co.Id)) //Where co is in colist2 as well
                            .ToList()
                    })).ToList();
            }
            else if (yDefined && zDefined)
            {
                cells =
                    xAxisCubeObjects.SelectMany((colist1, index1) =>
                    zAxisCubeObjects.Select((colist2, index2) =>
                    new Cell()
                    {
                        x = 0,
                        y = index1 + 1,
                        z = index2 + 1,
                        CubeObjects = colist1
                            .Where(co => colist2.Exists(co2 => co2.Id == co.Id)) //Where co is in colist2 as well
                            .ToList()
                    })).ToList();
            }
            else if (xDefined)
            {
                cells =
                    xAxisCubeObjects.Select((colist1, index1) =>
                    new Cell()
                    {
                        x = index1 + 1,
                        y = 1,
                        z = 0,
                        CubeObjects = colist1
                    }).ToList();
            }
            else if (yDefined)
            {
                cells =
                    yAxisCubeObjects.Select((colist1, index1) =>
                    new Cell()
                    {
                        x = 1,
                        y = index1 + 1,
                        z = 0,
                        CubeObjects = colist1
                    }).ToList();
            }
            else if (zDefined)
            {
                cells =
                    zAxisCubeObjects.Select((colist1, index1) =>
                    new Cell()
                    {
                        x = 0,
                        y = 1,
                        z = index1 + 1,
                        CubeObjects = colist1
                    }).ToList();
            }
            //Last filtering:
            cells.RemoveAll(c => c.CubeObjects.Count == 0);
            return Ok(JsonConvert.SerializeObject(cells,
                new JsonSerializerSettings() { ReferenceLoopHandling = ReferenceLoopHandling.Ignore }));
        }

        /// <summary>
        /// Given a boolean defined and a ParsedAxis, returns a List of List of CubeObjects.
        /// The indexes in the outer list repressents each tag on an axis.
        /// The indexes in the inner list reppressents the cube objects tagged with the tag.
        /// </summary>
        /// <param name="defined"></param>
        /// <param name="parsedAxis"></param>
        /// <returns></returns>
        private List<List<CubeObject>> getAllCubeObjectsFromAxis(bool defined, ParsedAxis parsedAxis)
        {
            if (defined)
            {
                if (parsedAxis.AxisType.Equals("Tagset"))
                {
                    return getAllCubeObjectsFrom_Tagset_Axis(parsedAxis);
                }
                else if (parsedAxis.AxisType.Equals("Hierarchy"))
                {
                    return getAllCubeObjectsFrom_Hierarchy_Axis(parsedAxis);
                }
                else if (parsedAxis.AxisType.Equals("HierarchyLeaf")) //A HierarchyLeaf is a Node with no children.
                {
                    return getAllCubeObjectsFrom_HierarchyLeaf_Axis(parsedAxis);
                }
                else
                {
                    throw new Exception("AxisType: " + parsedAxis.AxisType + " was not recognized!");
                }
            }
            else return null;
        }

        /// <summary>
        /// Returns list of cubeObjects per tag. Called with ParsedAxis of type "Tagset".
        /// </summary>
        /// <param name="parsedAxis"></param>
        /// <returns></returns>
        private List<List<CubeObject>> getAllCubeObjectsFrom_Tagset_Axis(ParsedAxis parsedAxis)
        {
            //Getting tags from database:
            List<Tag> tags;
            using (var context = new ObjectContext())
            {
                var Tagset = context.Tagsets
                    .Include(ts => ts.Tags)
                    //.Include(co => co.ObjectTagRelations)
                    .Where(ts => ts.Id == parsedAxis.TagsetId)
                    .FirstOrDefault();
                tags = Tagset.Tags.OrderBy(t => t.Name).ToList();
            }
            return tags
                .Select(t => getAllCubeObjectsTaggedWith(t.Id))
                .ToList();
        }

        /// <summary>
        /// Returns list of cubeObjects per tag. Called with ParsedAxis of type "Hierarchy".
        /// </summary>
        /// <param name="parsedAxis"></param>
        /// <returns></returns>
        private List<List<CubeObject>> getAllCubeObjectsFrom_Hierarchy_Axis(ParsedAxis parsedAxis)
        {
            List<Node> hierarchyNodes;
            Node rootNode = fetchWholeHierarchyFromRootNode(parsedAxis.HierarchyNodeId);
            hierarchyNodes = rootNode.Children;
            return hierarchyNodes
                .Select(n => getAllCubeObjectsTaggedWith(extractTagsFromHieararchy(n)))
                .ToList();
        }

        /// <summary>
        /// Returns list of cubeObjects per tag. Called with ParsedAxis of type "HierarchyLeaf".
        /// </summary>
        /// <param name="parsedAxis"></param>
        /// <returns></returns>
        private List<List<CubeObject>> getAllCubeObjectsFrom_HierarchyLeaf_Axis(ParsedAxis parsedAxis)
        {
            Node currentNode = fetchWholeHierarchyFromRootNode(parsedAxis.HierarchyNodeId);
            List<CubeObject> cubeObjectsTaggedWithTagFromNode = getAllCubeObjectsTaggedWith(currentNode.TagId);
            return new List<List<CubeObject>>() { cubeObjectsTaggedWithTagFromNode };
        }

        /// <summary>
        /// Fetches Node with Tag, Children and Children's Tags from a given nodeId.
        /// </summary>
        /// <param name="nodeId"></param>
        /// <returns></returns>
        private Node fetchWholeHierarchyFromRootNode(int nodeId)
        {
            Node currentNode;
            using (var context = new ObjectContext())
            {
                currentNode = context.Nodes
                    .Include(n => n.Tag)
                    .Include(n => n.Children)
                        .ThenInclude(cn => cn.Tag)
                    .Where(n => n.Id == nodeId)
                    .FirstOrDefault();
            }
            currentNode.Children.Sort((cn1, cn2) => cn1.Tag.Name.CompareTo(cn2.Tag.Name));
            List<Node> newChildNodes = new List<Node>();
            currentNode.Children.ForEach(cn => newChildNodes.Add(fetchWholeHierarchyFromRootNode(cn.Id)));
            currentNode.Children = newChildNodes;
            return currentNode;
        }

        /// <summary>
        /// Fetches all CubeObjects tagged with tagId.
        /// </summary>
        /// <param name="nodeId"></param>
        /// <returns></returns>
        private List<CubeObject> getAllCubeObjectsTaggedWith(int tagId)
        {
            List<CubeObject> cubeObjects;
            using (var context = new ObjectContext())
            {
                cubeObjects = context.CubeObjects
                    .Where(co => co.ObjectTagRelations.Where(otr => otr.TagId == tagId).Count() > 0) //Is tagged with tagId at least once
                    .ToList();
            }
            return cubeObjects;
        }
        
        /// <summary>
        /// Fetches all CubeObjects tagged with either of the tags in given list of tags.
        /// </summary>
        /// <param name="tags"></param>
        /// <returns></returns>
        private List<CubeObject> getAllCubeObjectsTaggedWith(List<Tag> tags)
        {
            List<CubeObject> cubeObjects = new List<CubeObject>();
            foreach (Tag t in tags)
            {
                cubeObjects.AddRange(getAllCubeObjectsTaggedWith(t.Id));
            }
            return cubeObjects;
        }
        
        /// <summary>
        /// Given a Node, returns all the tags in the hierarchy.
        /// </summary>
        /// <param name="hierarchy"></param>
        /// <returns></returns>
        private List<Tag> extractTagsFromHieararchy(Node hierarchy)
        {
            List<Tag> tags = new List<Tag>();
            tags.Add(hierarchy.Tag);
            var tagsFromSubHierarchies = hierarchy.Children
                .SelectMany(n => extractTagsFromHieararchy(n)) //Same as flatMap
                .ToList();
            tags.AddRange(tagsFromSubHierarchies);
            return tags;
        }
    }
}
