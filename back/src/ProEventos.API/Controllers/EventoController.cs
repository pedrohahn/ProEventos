using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Extensions.Logging;
using ProEventos.API.Models;

namespace ProEventos.API.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class EventoController : ControllerBase
    {

        public IEnumerable<Evento> _evento =  new Evento[] {
                new Evento(){
                    EventoId = 1,
                    Local = "São Paulo",
                    DataEvento = DateTime.Now.AddDays(2).ToString("dd/MM/yyyy"),
                    Tema = "Angular e .NET",
                    QtdePessoas = "1000",
                    Lote = "1",
                    ImageURL = "google.cm"
                },
                new Evento(){
                    EventoId = 2,
                    Local = "Rio de Janeiro",
                    DataEvento = DateTime.Now.AddDays(3).ToString("dd/MM/yyyy"),
                    Tema = "Angular e .NET",
                    QtdePessoas = "1000",
                    Lote = "1",
                    ImageURL = "google.cm"
                }
            };
        public EventoController()
        {
            
        }

        [HttpGet]
        public IEnumerable<Evento> Get()
        {
           return _evento;
        } 

        [HttpGet("{id}")]
        public IEnumerable<Evento> GetById(int id)
        {
           return _evento.Where(evento => evento.EventoId == id);
        } 

        [HttpPost]
        public string Post()
        {
            return "Exemplo de Post";
        } 

        [HttpPut("{id}")]
        public string Put(int id)
        {
            return $"Exemplo de Put para o ID {id}";
        } 

        [HttpDelete("{id}")]
        public string Delete(int id)    
        {
            return "Exemplo de Delete";
        }

    }
}
