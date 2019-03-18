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
    public class HierarchyController : ControllerBase
    {
        // GET: api/Hierarchy
        [HttpGet]
        public IActionResult Get()
        {
            List<Hierarchy> allHierarchies;
            using (var context = new ObjectContext())
            {
                allHierarchies = context.Hierarchies
                    .Include(h => h.Nodes)
                    .ToList();
            }
            return Ok(JsonConvert.SerializeObject(allHierarchies,
                new JsonSerializerSettings() { ReferenceLoopHandling = ReferenceLoopHandling.Ignore }));
        }

        // GET: api/Hierarchy/5
        [HttpGet("{id}", Name = "GetHirarchy")]
        public IActionResult Get(int id)
        {
            Hierarchy hierarchyFound;
            using (var context = new ObjectContext())
            {
                hierarchyFound = context.Hierarchies
                    .Include(h => h.Nodes)
                        .ThenInclude(node => node.Tag)
                    .Where(h => h.Id == id)
                    .FirstOrDefault();
            }
            if(hierarchyFound == null)
            {
                return NotFound();
            }
            return Ok(JsonConvert.SerializeObject(hierarchyFound,
                new JsonSerializerSettings() { ReferenceLoopHandling = ReferenceLoopHandling.Ignore }));
        }
    }
}
