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

describe('Testes de Produtos', () => {
  let productId;
  let categoryId;

  before(async () => {
    // Criar categoria para associar ao produto
    const mutationAddCategory = `
      mutation {
        addCategory(input: { name: "Categoria para Produto Teste", photo: "https://img.freepik.com/fotos-gratis/loja-de-roupas-loja-de-roupas-em-cabide-na-boutique-loja-moderna_1150-8886.jpg?semt=ais_hybrid&w=740&q=80" }) {
          id
          name
        }
      }
    `;

    const res = await pactum.spec()
        .post('http://lojaebac.ebaconline.art.br/graphql')
      .withHeaders('Authorization', token)
      .withJson({ query: mutationAddCategory })
      .expectStatus(200);

    categoryId = res.body.data.addCategory.id;
  });

  after(async () => {
    // Deletar categoria criada após os testes
    const mutationDeleteCategory = `
      mutation {
        deleteCategory(id: "${categoryId}") {
          success
        }
      }
    `;

    await pactum.spec()
        .post('http://lojaebac.ebaconline.art.br/graphql')
      .withHeaders('Authorization', token)
      .withJson({ query: mutationDeleteCategory })
      .expectStatus(200);
  });

  it('Deve adicionar um produto com sucesso', async () => {
    const mutationAddProduct = `
      mutation {
        addProduct(input: {
          name: "Roupas",
          description: "Descrição do produto teste",
          price: 150.50,
          photo: "https://namu.com.br/portal/wp-content/uploads/2019/10/roupas.png",
          categoryId: "${categoryId}"
        }) {
          id
          name
          price
          category {
            id
          }
        }
      }
    `;

    const res = await pactum.spec()
      .post('http://lojaebac.ebaconline.art.br/graphql')
      .withHeaders('Authorization', token)
      .withJson({ query: mutationAddProduct })
      .expectStatus(200);
    
    productId = res.body.data.addProduct.id;

    pactum.expect(res).to.have.jsonLike({
      data: {
        addProduct: {
          id: productId,
          name: "Roupas",
          price: 150.50,
          category: {
            id: categoryId
          }
        }
      }
    });
  });

  it('Deve editar o produto', async () => {
    const mutationEditProduct = `
    mutation {
      editProduct(id: "${productId}", input: {
        name: "Roupas Lisas",
        description: "Descrição atualizada do produto",
        price: 200.75,
        photo: "https://thumbs.dreamstime.com/b/mulher-admirando-camisa-amarela-na-loja-de-roupas-uma-em-olhando-para-vibrante-um-display-que-contempla-compra-gerada-por-ia-381225114.jpg",
        categoryId: "${categoryId}"
      }) {
        id
        name
        price
        description
        photo
        category {
          id
        }
      }
    }
    `;

    const res = await pactum.spec()
      .post('http://lojaebac.ebaconline.art.br/graphql')
      .withHeaders('Authorization', token)
      .withJson({ query: mutationEditProduct })
      .expectStatus(200);

    pactum.expect(res).to.have.jsonLike({
      data: {
        editProduct: {
          id: productId,
          name: "Roupas Lisas",
          price: 200.75,
          description: "Descrição atualizada do produto",
          photo: "https://thumbs.dreamstime.com/b/mulher-admirando-camisa-amarela-na-loja-de-roupas-uma-em-olhando-para-vibrante-um-display-que-contempla-compra-gerada-por-ia-381225114.jpg",
          category: {
            id: categoryId
          }
        }
      }
    });
  });

  it('Deve deletar o produto', async () => {
    const mutationDeleteProduct = `
      mutation {
        deleteProduct(id: "${productId}") {
          success
          message
        }
      }
    `;

    const res = await pactum.spec()
      .post('http://lojaebac.ebaconline.art.br/graphql')
      .withHeaders('Authorization', token)
      .withJson({ query: mutationDeleteProduct })
      .expectStatus(200);

    pactum.expect(res).to.have.jsonLike({
      data: {
        deleteProduct: {
          success: true
        }
      }
    });
  });

});
