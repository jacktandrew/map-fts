class Address < ActiveRecord::Base
  belongs_to :neighborhood
  belongs_to :spot
end
