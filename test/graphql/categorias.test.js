// test.js
const { spec } = require('pactum');
const { eachLike, like } = require('pactum-matchers');

let token;
beforeEach(async () => {
    token = await spec()
        .post('http://lojaebac.ebaconline.art.br/graphql')
        .withGraphQLQuery(`
        mutation AuthUser($email: String, $password: String) {
            authUser(email: $email, password: $password) {
              success
              token
            }
          }
    `)
        .withGraphQLVariables({
            "email": "admin@admin.com",
            "password": "admin123"
        })
        .returns('data.authUser.token')
  });


  describe('Testes de Categoria', () => {
    let categoryId;

    it('Deve adicionar uma categoria com sucesso', async () => {
      const query = `
        mutation {
          addCategory(input: { name: "Roupas", photo: "https://static.vecteezy.com/ti/fotos-gratis/t2/28246030-colorida-roupas-em-roupas-prateleira-pastel-colorida-armario-de-roupa-dentro-compras-loja-ou-quarto-arco-iris-cor-roupas-escolha-em-cabides-casa-guarda-roupa-conceito-generativo-ai-foto.jpg" }) {
            id
            name
          }
        }
      `;

      const res = await pactum.spec()
        .post('http://lojaebac.ebaconline.art.br/graphql')
        .withHeaders('Authorization', token)
        .withJson({ query })
        .expectStatus(200);

      categoryId = res.body.data.addCategory.id;

      pactum.expect(res).to.have.jsonLike({
        data: {
          addCategory: {
            id: categoryId,
            name: "Roupas"
          }
        }
      });
    });

    it('Deve editar uma categoria', async () => {
      const query = `
        mutation {
          editCategory(id: "${categoryId}", input: { name: "Roupa", photo: "https://acdn-us.mitiendanube.com/stores/002/037/298/products/vestido_feminino_rodado_estampado_moda_roupas_femininas_2315_2_c01626b6fc81c1ea5927f4e1b223ff35-ea5927f4e1b223ff3516492706084994-1024-1024.jpg" }) {
            id
            name
            photo
          }
        }
      `;

      const res = await pactum.spec()
        .post('http://lojaebac.ebaconline.art.br/graphql')
        .withHeaders('Authorization', token)
        .withJson({ query })
        .expectStatus(200);

      pactum.expect(res).to.have.jsonLike({
        data: {
          editCategory: {
            id: categoryId,
            name: "Roupa",
            photo: "https://acdn-us.mitiendanube.com/stores/002/037/298/products/vestido_feminino_rodado_estampado_moda_roupas_femininas_2315_2_c01626b6fc81c1ea5927f4e1b223ff35-ea5927f4e1b223ff3516492706084994-1024-1024.jpg"
          }
        }
      });
    });

    it('Deve deletar uma categoria', async () => {
      const query = `
        mutation {
          deleteCategory(id: "${categoryId}") {
            success
            message
          }
        }
      `;

      const res = await pactum.spec()
        .post('http://lojaebac.ebaconline.art.br/graphql')
        .withHeaders('Authorization', token)
        .withJson({ query })
        .expectStatus(200);

      pactum.expect(res).to.have.jsonLike({
        data: {
          deleteCategory: {
            success: true
          }
        }
      });
    });
  });