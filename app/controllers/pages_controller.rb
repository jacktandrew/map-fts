class PagesController < ApplicationController
  respond_to :html, :js

  def home
    @neighborhoods = Neighborhood.order('name')
  end

  def data
    @neighborhoods = Neighborhood.all
  end

end
